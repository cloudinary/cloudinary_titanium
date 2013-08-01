(function() {
  var call_api, config, only, transformation_string, utils, _,
    __slice = [].slice;

  _ = require("/lib/underscore");

  utils = require("/lib/cloudinary/utils");

  config = require("/lib/cloudinary/config");

  exports.usage = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", ["usage"], {}, callback, options);
  };

  exports.resource_types = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", ["resources"], {}, callback, options);
  };

  exports.resources = function(callback, options) {
    var resource_type, type, uri, _ref;
    if (options == null) {
      options = {};
    }
    resource_type = (_ref = options["resource_type"]) != null ? _ref : "image";
    type = options["type"];
    uri = ["resources", resource_type];
    if (type != null) {
      uri.push(type);
    }
    return call_api("get", uri, only(options, "next_cursor", "max_results", "prefix"), callback, options);
  };

  exports.resources_by_tag = function(tag, callback, options) {
    var resource_type, uri, _ref;
    if (options == null) {
      options = {};
    }
    resource_type = (_ref = options["resource_type"]) != null ? _ref : "image";
    uri = ["resources", resource_type, "tags", tag];
    return call_api("get", uri, only(options, "next_cursor", "max_results"), callback, options);
  };

  exports.resource = function(public_id, callback, options) {
    var resource_type, type, uri, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    resource_type = (_ref = options["resource_type"]) != null ? _ref : "image";
    type = (_ref1 = options["type"]) != null ? _ref1 : "upload";
    uri = ["resources", resource_type, type, public_id];
    return call_api("get", uri, only(options, "exif", "colors", "faces", "image_metadata", "pages", "max_results"), callback, options);
  };

  exports.delete_resources = function(public_ids, callback, options) {
    var resource_type, type, uri, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    resource_type = (_ref = options["resource_type"]) != null ? _ref : "image";
    type = (_ref1 = options["type"]) != null ? _ref1 : "upload";
    uri = ["resources", resource_type, type];
    return call_api("delete", uri, _.extend({
      "public_ids[]": public_ids
    }, only(options, "keep_original")), callback, options);
  };

  exports.delete_resources_by_prefix = function(prefix, callback, options) {
    var resource_type, type, uri, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    resource_type = (_ref = options["resource_type"]) != null ? _ref : "image";
    type = (_ref1 = options["type"]) != null ? _ref1 : "upload";
    uri = ["resources", resource_type, type];
    return call_api("delete", uri, _.extend({
      prefix: prefix
    }, only(options, "keep_original")), callback, options);
  };

  exports.delete_resources_by_tag = function(tag, callback, options) {
    var resource_type, uri, _ref;
    if (options == null) {
      options = {};
    }
    resource_type = (_ref = options["resource_type"]) != null ? _ref : "image";
    uri = ["resources", resource_type, "tags", tag];
    return call_api("delete", uri, only(options, "keep_original"), callback, options);
  };

  exports.delete_derived_resources = function(derived_resource_ids, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["derived_resources"];
    return call_api("delete", uri, {
      "derived_resource_ids": utils.build_array(derived_resource_ids)
    }, callback, options);
  };

  exports.tags = function(callback, options) {
    var resource_type, uri, _ref;
    if (options == null) {
      options = {};
    }
    resource_type = (_ref = options["resource_type"]) != null ? _ref : "image";
    uri = ["tags", resource_type];
    return call_api("get", uri, only(options, "next_cursor", "max_results", "prefix"), callback, options);
  };

  exports.transformations = function(callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("get", ["transformations"], only(options, "next_cursor", "max_results"), callback, options);
  };

  exports.transformation = function(transformation, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["transformations", transformation_string(transformation)];
    return call_api("get", uri, only(options, "max_results"), callback, options);
  };

  exports.delete_transformation = function(transformation, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["transformations", transformation_string(transformation)];
    return call_api("delete", uri, {}, callback, options);
  };

  exports.update_transformation = function(transformation, updates, callback, options) {
    var params, uri;
    if (options == null) {
      options = {};
    }
    uri = ["transformations", transformation_string(transformation)];
    params = only(updates, "allowed_for_strict");
    if (updates.unsafe_update != null) {
      params.unsafe_update = transformation_string(updates.unsafe_update);
    }
    return call_api("put", uri, params, callback, options);
  };

  exports.create_transformation = function(name, definition, callback, options) {
    var uri;
    if (options == null) {
      options = {};
    }
    uri = ["transformations", name];
    return call_api("post", uri, {
      transformation: transformation_string(definition)
    }, callback, options);
  };

  call_api = function(method, uri, params, callback, options) {
    var api_key, api_secret, api_url, cloud_name, cloudinary, xhr, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    cloudinary = (_ref = (_ref1 = options["upload_prefix"]) != null ? _ref1 : config().upload_prefix) != null ? _ref : "https://api.cloudinary.com";
    cloud_name = (function() {
      var _ref3;
      if ((_ref2 = (_ref3 = options["cloud_name"]) != null ? _ref3 : config().cloud_name) != null) {
        return _ref2;
      } else {
        throw new Error("Must supply cloud_name");
      }
    })();
    api_key = (function() {
      var _ref4;
      if ((_ref3 = (_ref4 = options["api_key"]) != null ? _ref4 : config().api_key) != null) {
        return _ref3;
      } else {
        throw new Error("Must supply api_key");
      }
    })();
    api_secret = (function() {
      var _ref5;
      if ((_ref4 = (_ref5 = options["api_secret"]) != null ? _ref5 : config().api_secret) != null) {
        return _ref4;
      } else {
        throw new Error("Must supply api_secret");
      }
    })();
    api_url = [cloudinary, "v1_1", cloud_name].concat(uri).join("/");
    api_url += "?" + utils.querystring.stringify(params);
    xhr = Ti.Network.createHTTPClient({
      onload: function() {
        var e, result;
        if (_.include([200, 400, 401, 500], this.status)) {
          try {
            result = JSON.parse(this.responseText);
          } catch (_error) {
            e = _error;
            result = {
              error: {
                message: "Server return invalid JSON response. Status Code " + this.status
              }
            };
          }
          if (result["error"]) {
            result["error"]["http_code"] = this.status;
          } else {
            result["rate_limit_allowed"] = parseInt(this.getResponseHeader("x-featureratelimit-limit"));
            result["rate_limit_reset_at"] = new Date(this.getResponseHeader("x-featureratelimit-reset"));
            result["rate_limit_remaining"] = parseInt(this.getResponseHeader("x-featureratelimit-remaining"));
          }
          return callback(result);
        } else {
          return callback({
            error: {
              message: "Server returned unexpected status code - " + this.status
            }
          });
        }
      },
      onerror: function(e) {
        return callback({
          error: e
        });
      },
      timeout: (_ref5 = options["timeout"]) != null ? _ref5 : 60 * 1000
    });
    xhr.open(method.toUpperCase(), api_url);
    xhr.setRequestHeader('Authorization', 'Basic ' + Ti.Utils.base64encode(api_key + ':' + api_secret));
    xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    return xhr.send();
  };

  only = function() {
    var hash, key, keys, result, _i, _len;
    hash = arguments[0], keys = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    result = {};
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      if (hash[key] != null) {
        result[key] = hash[key];
      }
    }
    return result;
  };

  transformation_string = function(transformation) {
    if (_.isString(transformation)) {
      return transformation;
    } else {
      return utils.generate_transformation_string(_.extend(transformation));
    }
  };

}).call(this);
