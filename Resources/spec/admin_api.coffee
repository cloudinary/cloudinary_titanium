_ = require("/lib/underscore")
utils = require("/lib/cloudinary/utils")
config = require("/lib/cloudinary/config")

exports.usage = (callback, options={}) ->
  call_api("get", ["usage"], {}, callback, options)

exports.resource_types = (callback, options={}) ->
  call_api("get", ["resources"], {}, callback, options)

exports.resources = (callback, options={}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"]
  uri = ["resources", resource_type]
  uri.push type if type?
  call_api("get", uri, only(options, "next_cursor", "max_results", "prefix"), callback, options)

exports.resources_by_tag = (tag, callback, options={}) ->
  resource_type = options["resource_type"] ? "image"
  uri = ["resources", resource_type, "tags", tag]
  call_api("get", uri, only(options, "next_cursor", "max_results"), callback, options)

exports.resource = (public_id, callback, options={}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type, public_id]
  call_api("get", uri, only(options, "exif", "colors", "faces", "image_metadata", "pages", "max_results"), callback, options)

exports.delete_resources = (public_ids, callback, options={}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type]
  call_api("delete", uri, _.extend({"public_ids[]": public_ids}, only(options, "keep_original")), callback, options)

exports.delete_resources_by_prefix = (prefix, callback, options={}) ->
  resource_type = options["resource_type"] ? "image"
  type = options["type"] ? "upload"
  uri = ["resources", resource_type, type]
  call_api("delete", uri, _.extend({prefix: prefix}, only(options, "keep_original")), callback, options)

exports.delete_resources_by_tag = (tag, callback, options={}) ->
  resource_type = options["resource_type"] ? "image"
  uri = ["resources", resource_type, "tags", tag]
  call_api("delete", uri, only(options, "keep_original"), callback, options)

exports.delete_derived_resources = (derived_resource_ids, callback, options={}) ->
  uri = ["derived_resources"]
  call_api("delete", uri, {"derived_resource_ids": utils.build_array derived_resource_ids}, callback, options)

exports.tags = (callback, options={}) ->
  resource_type = options["resource_type"] ? "image"
  uri = ["tags", resource_type]
  call_api("get", uri, only(options, "next_cursor", "max_results", "prefix"), callback, options)

exports.transformations = (callback, options={}) ->
  call_api("get", ["transformations"], only(options, "next_cursor", "max_results"), callback, options)

exports.transformation = (transformation, callback, options={}) ->
  uri = ["transformations", transformation_string(transformation)]
  call_api("get", uri, only(options, "max_results"), callback, options)

exports.delete_transformation = (transformation, callback, options={}) ->
  uri = ["transformations", transformation_string(transformation)]
  call_api("delete", uri, {}, callback, options)

# updates - currently only supported update is the "allowed_for_strict" boolean flag
exports.update_transformation = (transformation, updates, callback, options={}) ->
  uri = ["transformations", transformation_string(transformation)]
  params = only(updates, "allowed_for_strict")
  params.unsafe_update = transformation_string(updates.unsafe_update) if updates.unsafe_update?
  call_api("put", uri, params, callback, options)

exports.create_transformation = (name, definition, callback, options={}) ->
  uri = ["transformations", name]
  call_api("post", uri, {transformation: transformation_string(definition)}, callback, options)

call_api = (method, uri, params, callback, options) ->
  cloudinary = options["upload_prefix"] ? config().upload_prefix ? "https://api.cloudinary.com"
  cloud_name = options["cloud_name"] ? config().cloud_name ? throw("Must supply cloud_name")
  api_key = options["api_key"] ? config().api_key ? throw("Must supply api_key")
  api_secret = options["api_secret"] ? config().api_secret ? throw("Must supply api_secret")
  api_url = [cloudinary, "v1_1", cloud_name].concat(uri).join("/")

  if method == "get"
    api_url += "?" + utils.querystring.stringify(params)

  xhr = Ti.Network.createHTTPClient
    onload: ->
      if _.include([200,400,401,500], @status)
        try
          result = JSON.parse(@responseText)
        catch e
          result = {error: {message: "Server return invalid JSON response. Status Code #{@status}"}}
        if result["error"]
          result["error"]["http_code"] = @status
        else
          result["rate_limit_allowed"] = parseInt(@getResponseHeader "x-featureratelimit-limit")
          result["rate_limit_reset_at"] = new Date(@getResponseHeader "x-featureratelimit-reset")
          result["rate_limit_remaining"] = parseInt(@getResponseHeader "x-featureratelimit-remaining")
        callback(result)
      else
        callback(error: {message: "Server returned unexpected status code - #{@status}"})
    onerror: (e) ->
      callback(error: e)
    timeout: options["timeout"] ? 60*1000

  xhr.setRequestHeader('Authorization',
      'Basic ' + Ti.Utils.base64encode(api_key+':'+api_secret))
  xhr.open method.toUpperCase(), api_url
  #xhr.setRequestHeader "enctype", "application/x-www-form-urlencoded"
  #xhr.setRequestHeader "enctype", "multipart/form-data"
  xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
  Ti.API.log 'API XHR' + JSON.stringify(xhr)
  Ti.API.log 'API params' + JSON.stringify(params)
  xhr.send JSON.stringify params
  #xhr.send params


only = (hash, keys...) ->
  result = {}
  for key in keys
    result[key] = hash[key] if hash[key]?
  result

transformation_string = (transformation) ->
  if _.isString(transformation)
    transformation
  else
    utils.generate_transformation_string(_.extend(transformation))

