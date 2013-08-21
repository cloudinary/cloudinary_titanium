_ = require("../underscore")
utils = require("./utils")
config = require("./config")

build_eager = (transformations) ->
  (for transformation in utils.build_array(transformations)
    transformation = _.clone(transformation)
    _.filter([utils.generate_transformation_string(transformation), transformation.format], utils.present).join("/")
  ).join("|")

build_custom_headers = (headers) ->
  if !headers?
    return undefined
  else if _.isArray(headers)
  else if _.isObject(headers)
    headers = [k + ": " + v for k, v of headers]
  else
    return headers
  return headers.join("\n")

build_upload_params = (options) ->
  params =
    timestamp: utils.timestamp(),
    transformation: utils.generate_transformation_string(options),
    public_id: options.public_id,
    callback: options.callback,
    format: options.format,
    backup: options.backup,
    faces: options.faces,
    exif: options.exif,
    image_metadata: options.image_metadata,
    colors: options.colors,
    type: options.type,
    eager: build_eager(options.eager),
    headers: build_custom_headers(options.headers),
    use_filename: options.use_filename,
    notification_url: options.notification_url,
    eager_notification_url: options.eager_notification_url,
    eager_async: options.eager_async,
    invalidate: options.invalidate,
    discard_original_filename: options.discard_original_filename,
    proxy: options.proxy,
    folder: options.folder,    
    tags: options.tags && utils.build_array(options.tags).join(",")
  params

exports.upload = (file, callback, options={}) ->
  call_api "upload", callback, options, ->
    params = build_upload_params(options)
    if typeof(file) == 'string'
      if (file.match(/^https?:|^s3:|^data:[^;]*;base64,([a-zA-Z0-9\/+\n=]+)$/))
        return [params, file: file]
      else
        return [params, {}, Ti.Filesystem.getFile file]
    else
      return [params, {}, file]

exports.explicit = (public_id, callback, options={}) ->
  call_api "explicit", callback, options, ->
    return [
      timestamp: utils.timestamp()
      type: options.type
      public_id: public_id
      callback: options.callback
      eager: build_eager(options.eager)
      headers: build_custom_headers(options.headers)
      tags: options.tags ? utils.build_array(options.tags).join(",")
    ]

exports.destroy = (public_id, callback, options={}) ->
  call_api "destroy", callback, options, ->
    return [timestamp: utils.timestamp(), type: options.type, invalidate: options.invalidate,public_id:  public_id]

exports.rename = (from_public_id, to_public_id, callback, options={}) ->
  call_api "rename", callback, options, ->
    return [timestamp: utils.timestamp(), type: options.type, from_public_id: from_public_id, to_public_id: to_public_id, overwrite: options.overwrite]

TEXT_PARAMS = ["public_id", "font_family", "font_size", "font_color", "text_align", "font_weight", "font_style", "background", "opacity", "text_decoration"]
exports.text = (text, callback, options={}) ->
  call_api "text", callback, options, ->
    params = {timestamp: utils.timestamp(), text: text}
    for k in TEXT_PARAMS when options[k]?
      params[k] = options[k]
    [params]

exports.generate_sprite = (tag, callback, options={}) ->
  call_api "sprite", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend(options, fetch_format: options.format))
    return [{timestamp: utils.timestamp(), tag: tag, transformation: transformation, async: options.async, notification_url: options.notification_url}]

exports.multi = (tag, callback, options={}) ->
  call_api "multi", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend(options))
    return [{timestamp: utils.timestamp(), tag: tag, transformation: transformation, format: options.format, async: options.async, notification_url: options.notification_url}]

exports.explode = (public_id, callback, options={}) ->
  call_api "explode", callback, options, ->
    transformation = utils.generate_transformation_string(_.extend(options))
    return [{timestamp: utils.timestamp(), public_id: public_id, transformation: transformation, format: options.format, type: options.type, notification_url: options.notification_url}]

# options may include 'exclusive' (boolean) which causes clearing this tag from all other resources
exports.add_tag = (tag, public_ids = [], callback, options = {}) ->
  exclusive = utils.option_consume("exclusive", options)
  command = if exclusive then "set_exclusive" else "add"
  call_tags_api(tag, command, public_ids, callback, options)

exports.remove_tag = (tag, public_ids = [], callback, options = {}) ->
  call_tags_api(tag, "remove", public_ids, callback, options)

exports.replace_tag = (tag, public_ids = [], callback, options = {}) ->
  call_tags_api(tag, "replace", public_ids, callback, options)

call_tags_api = (tag, command, public_ids = [], callback, options = {}) ->
  call_api "tags", callback, options, ->
    return [{timestamp: utils.timestamp(), tag: tag, public_ids: utils.build_array(public_ids), command:  command, type: options.type}]

call_api = (action, callback, options, get_params) ->
  options = _.clone(options)

  api_key = options.api_key ? config().api_key ? throw new Error("Must supply api_key")
  [params, unsigned_params, file] = get_params.call()

  if options.signature?
      params.signature = options.signature
      params.timestamp = options.timestamp
  else
      api_secret = options.api_secret ? config().api_secret ? throw new Error("Must supply api_secret")
      params.signature = utils.api_sign_request(params, api_secret)

  params = _.extend(params, unsigned_params)
  params.api_key = api_key
  params.file = file if file

  api_url = utils.api_url(action, options)

  xhr = Ti.Network.createHTTPClient
    onload: ->
      if _.include([200,400,401,500], @status)
        try
          result = JSON.parse(@responseText)
        catch e
          result = {error: {message: "Server return invalid JSON response. Status Code #{@status}"}}
        result["error"]["http_code"] = @status if result["error"]
        callback(result)
      else
        callback(error: {message: "Server returned unexpected status code - #{@status}"})
    onerror: (e) ->
      callback(error: e)
    timeout: options["timeout"] ? 60*1000

  xhr.open 'POST', api_url

  boundary = "boundary-#{Math.random()}"
  xhr.setRequestHeader "Content-Type", "multipart/form-data; boundary=#{boundary}"

  post_data = Ti.createBuffer()
  for key, value of params 
    if _.isArray(value)
      for v in value 
        post_data.append EncodeFieldPart(boundary, key+"[]", v)
    else if utils.present(value)
      post_data.append EncodeFieldPart(boundary, key, value) 
 
  if file?
    filename = file.name 
    post_data.append EncodeFilePart(boundary, 'application/octet-stream', 'file', filename)
    raw = Ti.Stream.createStream(source: file.read(), mode: Ti.Stream.MODE_READ)
    content = Ti.Stream.readAll(raw)
    post_data.append content
    post_data.append Ti.createBuffer(value: "\r\n")

  post_data.append Ti.createBuffer(value: "--" + boundary + "--")
  xhr.send post_data.toBlob()

EncodeFieldPart = (boundary, name, value) ->
  return_part = "--#{boundary}\r\n";
  return_part += "Content-Disposition: form-data; name=\"#{name}\"\r\n\r\n"
  return_part += value + "\r\n"
  Ti.createBuffer(value: return_part)

EncodeFilePart = (boundary,type,name,filename) ->
  return_part = "--#{boundary}\r\n";
  return_part += "Content-Disposition: form-data; name=\"#{name}\"; filename=\"#{filename}\"\r\n";
  return_part += "Content-Type: #{type}\r\n\r\n";
  Ti.createBuffer(value: return_part)


