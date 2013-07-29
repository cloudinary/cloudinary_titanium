(function() {
  var TEXT_PARAMS, build_custom_headers, build_eager, build_upload_params, call_api, call_tags_api, config, utils, _;

  _ = require("../underscore");

  utils = require("./utils");

  config = require("./config");

  build_eager = function(transformations) {
    var transformation;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = utils.build_array(transformations);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        transformation = _ref[_i];
        transformation = _.clone(transformation);
        _results.push(_.filter([utils.generate_transformation_string(transformation), transformation.format], utils.present).join("/"));
      }
      return _results;
    })()).join("|");
  };

  build_custom_headers = function(headers) {
    var k, v;
    if (!(headers != null)) {
      return void 0;
    } else if (_.isArray(headers)) {

    } else if (_.isObject(headers)) {
      headers = [
        (function() {
          var _results;
          _results = [];
          for (k in headers) {
            v = headers[k];
            _results.push(k + ": " + v);
          }
          return _results;
        })()
      ];
    } else {
      return headers;
    }
    return headers.join("\n");
  };

  build_upload_params = function(options) {
    var params;
    params = {
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
      tags: options.tags && utils.build_array(options.tags).join(",")
    };
    return params;
  };

  exports.upload_stream = function(callback, options) {
    var fs, path, stream, temp, temp_file, temp_filename;
    if (options == null) {
      options = {};
    }
    fs = require('fs');
    path = require('path');
    temp = require('temp');
    temp_filename = temp.path();
    temp_file = fs.createWriteStream(temp_filename, {
      flags: 'w',
      encoding: 'binary',
      mode: 0x180
    });
    stream = {
      write: function(data) {
        return temp_file.write(new Buffer(data, 'binary'));
      },
      end: function() {
        var finish;
        temp_file.on("close", function() {
          try {
            return exports.upload(temp_filename, finish, options);
          } catch (e) {
            return finish({
              error: {
                message: e
              }
            });
          }
        });
        temp_file.end();
        return finish = function(result) {
          fs.unlink(temp_filename);
          return callback.call(null, result);
        };
      }
    };
    return stream;
  };

  exports.upload = function(file, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("upload", callback, options, function() {
      var params;
      params = build_upload_params(options);
      if (typeof file === 'string') {
        if (file.match(/^https?:/) || file.match(/^data:image\/\w*;base64,([a-zA-Z0-9\/+\n=]+)$/)) {
          return [
            params, {
              file: file
            }
          ];
        } else {
          if (file[0] !== '/') {
            file = '../../' + file;
          }
          return [params, {}, Ti.Filesystem.getFile(file)];
        }
      } else {
        return [params, {}, file];
      }
    });
  };

  exports.explicit = function(public_id, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("explicit", callback, options, function() {
      var _ref;
      return [
        {
          timestamp: utils.timestamp(),
          type: options.type,
          public_id: public_id,
          callback: options.callback,
          eager: build_eager(options.eager),
          headers: build_custom_headers(options.headers),
          tags: (_ref = options.tags) != null ? _ref : utils.build_array(options.tags).join(",")
        }
      ];
    });
  };

  exports.destroy = function(public_id, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("destroy", callback, options, function() {
      return [
        {
          timestamp: utils.timestamp(),
          type: options.type,
          invalidate: options.invalidate,
          public_id: public_id
        }
      ];
    });
  };

  exports.rename = function(from_public_id, to_public_id, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("rename", callback, options, function() {
      return [
        {
          timestamp: utils.timestamp(),
          type: options.type,
          from_public_id: from_public_id,
          to_public_id: to_public_id,
          overwrite: options.overwrite
        }
      ];
    });
  };

  TEXT_PARAMS = ["public_id", "font_family", "font_size", "font_color", "text_align", "font_weight", "font_style", "background", "opacity", "text_decoration"];

  exports.text = function(text, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("text", callback, options, function() {
      var k, params, _i, _len;
      params = {
        timestamp: utils.timestamp(),
        text: text
      };
      for (_i = 0, _len = TEXT_PARAMS.length; _i < _len; _i++) {
        k = TEXT_PARAMS[_i];
        if (options[k] != null) {
          params[k] = options[k];
        }
      }
      return [params];
    });
  };

  exports.generate_sprite = function(tag, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("sprite", callback, options, function() {
      var transformation;
      transformation = utils.generate_transformation_string(_.extend(options, {
        fetch_format: options.format
      }));
      return [
        {
          timestamp: utils.timestamp(),
          tag: tag,
          transformation: transformation,
          async: options.async,
          notification_url: options.notification_url
        }
      ];
    });
  };

  exports.multi = function(tag, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("multi", callback, options, function() {
      var transformation;
      transformation = utils.generate_transformation_string(_.extend(options));
      return [
        {
          timestamp: utils.timestamp(),
          tag: tag,
          transformation: transformation,
          format: options.format,
          async: options.async,
          notification_url: options.notification_url
        }
      ];
    });
  };

  exports.explode = function(public_id, callback, options) {
    if (options == null) {
      options = {};
    }
    return call_api("explode", callback, options, function() {
      var transformation;
      transformation = utils.generate_transformation_string(_.extend(options));
      return [
        {
          timestamp: utils.timestamp(),
          public_id: public_id,
          transformation: transformation,
          format: options.format,
          type: options.type,
          notification_url: options.notification_url
        }
      ];
    });
  };

  exports.add_tag = function(tag, public_ids, callback, options) {
    var command, exclusive;
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    exclusive = utils.option_consume("exclusive", options);
    command = exclusive ? "set_exclusive" : "add";
    return call_tags_api(tag, command, public_ids, callback, options);
  };

  exports.remove_tag = function(tag, public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_tags_api(tag, "remove", public_ids, callback, options);
  };

  exports.replace_tag = function(tag, public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_tags_api(tag, "replace", public_ids, callback, options);
  };

  call_tags_api = function(tag, command, public_ids, callback, options) {
    if (public_ids == null) {
      public_ids = [];
    }
    if (options == null) {
      options = {};
    }
    return call_api("tags", callback, options, function() {
      return [
        {
          timestamp: utils.timestamp(),
          tag: tag,
          public_ids: utils.build_array(public_ids),
          command: command,
          type: options.type
        }
      ];
    });
  };

  call_api = function(action, callback, options, get_params) {
    var api_key, api_secret, api_url, file, params, unsigned_params, xhr, _ref, _ref1, _ref2, _ref3;
    options = _.clone(options);
    api_key = (function() {
      var _ref1;
      if ((_ref = (_ref1 = options.api_key) != null ? _ref1 : config().api_key) != null) {
        return _ref;
      } else {
        throw new Error("Must supply api_key");
      }
    })();
    _ref1 = get_params.call(), params = _ref1[0], unsigned_params = _ref1[1], file = _ref1[2];
    if (options.signature != null) {
      params.signature = options.signature;
      params.timestamp = options.timestamp;
    } else {
      api_secret = (function() {
        var _ref3;
        if ((_ref2 = (_ref3 = options.api_secret) != null ? _ref3 : config().api_secret) != null) {
          return _ref2;
        } else {
          throw new Error("Must supply api_secret");
        }
      })();
      params.signature = utils.api_sign_request(params, api_secret);
    }
    params = _.extend(params, unsigned_params);
    params.api_key = api_key;
    if (file) {
      params.file = file;
    }
    api_url = utils.api_url(action, options);
    xhr = Ti.Network.createHTTPClient({
      onload: function() {
        var result;
        if (_.include([200, 400, 401, 500], this.status)) {
          try {
            result = JSON.parse(this.responseText);
          } catch (e) {
            result = {
              error: {
                message: "Server return invalid JSON response. Status Code " + this.status
              }
            };
          }
          if (result["error"]) {
            result["error"]["http_code"] = this.status;
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
      timeout: (_ref3 = options["timeout"]) != null ? _ref3 : 60 * 1000
    });
    xhr.open('POST', api_url);
    if (file) {
      xhr.setRequestHeader("enctype", "multipart/form-data");
      return xhr.send(params);
    } else {
      xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      return xhr.send(JSON.stringify(params));
    }
  };

  exports.direct_upload = function(callback_url, options) {
    var api_url, k, params, v;
    params = build_upload_params(_.extend({
      callback: callback_url
    }, options));
    params.signature = utils.api_sign_request(params, config().api_secret);
    params.api_key = config().api_key;
    api_url = utils.api_url("upload", options);
    for (k in params) {
      v = params[k];
      if (!utils.present(v)) {
        delete params[k];
      }
    }
    return {
      hidden_fields: params,
      form_attrs: {
        action: api_url,
        method: "POST",
        enctype: "multipart/form-data"
      }
    };
  };

  exports.image_upload_tag = function(field, options) {
    var api_key, api_secret, cloudinary_upload_url, html_options, k, params, tag_options, v, _ref, _ref1, _ref2, _ref3;
    if (options == null) {
      options = {};
    }
    html_options = (_ref = options.html) != null ? _ref : {};
    if ((_ref1 = options.resource_type) == null) {
      options.resource_type = "auto";
    }
    cloudinary_upload_url = utils.api_url("upload", options);
    api_key = (function() {
      var _ref3;
      if ((_ref2 = (_ref3 = options.api_key) != null ? _ref3 : config().api_key) != null) {
        return _ref2;
      } else {
        throw new Error("Must supply api_key");
      }
    })();
    api_secret = (function() {
      var _ref4;
      if ((_ref3 = (_ref4 = options.api_secret) != null ? _ref4 : config().api_secret) != null) {
        return _ref3;
      } else {
        throw new Error("Must supply api_secret");
      }
    })();
    params = build_upload_params(options);
    params["signature"] = utils.api_sign_request(params, api_secret);
    params["api_key"] = api_key;
    for (k in params) {
      v = params[k];
      if (!utils.present(v)) {
        delete params[k];
      }
    }
    tag_options = _.extend(html_options, {
      type: "file",
      name: "file",
      "data-url": cloudinary_upload_url,
      "data-form-data": JSON.stringify(params),
      "data-cloudinary-field": field,
      "class": [html_options["class"], "cloudinary-fileupload"].join(" ")
    });
    return '<input ' + utils.html_attrs(tag_options) + '/>';
  };

}).call(this);
