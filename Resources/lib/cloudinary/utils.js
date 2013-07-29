(function() {
  var build_array, cloudinary_url, config, crc32, generate_transformation_string, html_only_attributes, option_consume, present, utf8_encode, _;

  _ = require("../underscore");

  config = require("./config");

  exports.CF_SHARED_CDN = "d3jpl91pxevbkh.cloudfront.net";

  exports.AKAMAI_SHARED_CDN = "cloudinary-a.akamaihd.net";

  exports.SHARED_CDN = exports.AKAMAI_SHARED_CDN;

  exports.timestamp = function() {
    return Math.floor(new Date().getTime() / 1000);
  };

  exports.option_consume = option_consume = function(options, option_name, default_value) {
    var result;
    result = options[option_name];
    delete options[option_name];
    if (result != null) {
      return result;
    } else {
      return default_value;
    }
  };

  exports.build_array = build_array = function(arg) {
    if (arg == null) {
      return [];
    } else if (_.isArray(arg)) {
      return arg;
    } else {
      return [arg];
    }
  };

  exports.present = present = function(value) {
    return !_.isUndefined(value) && ("" + value).length > 0;
  };

  exports.generate_transformation_string = generate_transformation_string = function(options) {
    var angle, background, base_transformation, base_transformations, border, crop, effect, flags, has_layer, height, key, named_transformation, no_html_sizes, param, params, result, short, simple_params, size, transformation, value, width, _ref, _ref1, _ref2, _ref3;
    if (_.isArray(options)) {
      result = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = options.length; _i < _len; _i++) {
          base_transformation = options[_i];
          _results.push(generate_transformation_string(_.clone(base_transformation)));
        }
        return _results;
      })();
      return result.join("/");
    }
    width = options["width"];
    height = options["height"];
    size = option_consume(options, "size");
    if (size) {
      _ref1 = (_ref = size.split("x"), width = _ref[0], height = _ref[1], _ref), options["width"] = _ref1[0], options["height"] = _ref1[1];
    }
    has_layer = options.overlay || options.underlay;
    crop = option_consume(options, "crop");
    angle = build_array(option_consume(options, "angle")).join(".");
    no_html_sizes = has_layer || present(angle) || crop === "fit" || crop === "limit";
    if (width && (no_html_sizes || parseFloat(width) < 1)) {
      delete options["width"];
    }
    if (height && (no_html_sizes || parseFloat(height) < 1)) {
      delete options["height"];
    }
    background = option_consume(options, "background");
    background = background && background.replace(/^#/, "rgb:");
    base_transformations = build_array(option_consume(options, "transformation", []));
    named_transformation = [];
    if (_.filter(base_transformations, _.isObject).length > 0) {
      base_transformations = _.map(base_transformations, function(base_transformation) {
        if (_.isObject(base_transformation)) {
          return generate_transformation_string(_.clone(base_transformation));
        } else {
          return generate_transformation_string({
            transformation: base_transformation
          });
        }
      });
    } else {
      named_transformation = base_transformations.join(".");
      base_transformations = [];
    }
    effect = option_consume(options, "effect");
    if (_.isArray(effect)) {
      effect = effect.join(":");
    }
    border = option_consume(options, "border");
    if (_.isObject(border)) {
      border = "" + ((_ref2 = border.width) != null ? _ref2 : 2) + "px_solid_" + (((_ref3 = border.color) != null ? _ref3 : "black").replace(/^#/, 'rgb:'));
    }
    flags = build_array(option_consume(options, "flags")).join(".");
    params = {
      c: crop,
      t: named_transformation,
      w: width,
      h: height,
      b: background,
      e: effect,
      a: angle,
      bo: border,
      fl: flags
    };
    simple_params = {
      x: "x",
      y: "y",
      radius: "r",
      gravity: "g",
      quality: "q",
      prefix: "p",
      default_image: "d",
      underlay: "u",
      overlay: "l",
      fetch_format: "f",
      density: "dn",
      page: "pg",
      color_space: "cs",
      delay: "dl",
      opacity: "o"
    };
    for (param in simple_params) {
      short = simple_params[param];
      params[short] = option_consume(options, param);
    }
    params = _.sortBy((function() {
      var _results;
      _results = [];
      for (key in params) {
        value = params[key];
        _results.push([key, value]);
      }
      return _results;
    })(), function(key, value) {
      return key;
    });
    params.push([option_consume(options, "raw_transformation")]);
    transformation = ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        if (present(_.last(param))) {
          _results.push(param.join("_"));
        }
      }
      return _results;
    })()).join(",");
    base_transformations.push(transformation);
    return _.filter(base_transformations, present).join("/");
  };

  exports.url = cloudinary_url = function(public_id, options) {
    var cdn_subdomain, cloud_name, cname, format, host, prefix, private_cdn, resource_type, secure, secure_distribution, shorten, subdomain, transformation, type, url, version;
    if (options == null) {
      options = {};
    }
    type = option_consume(options, "type", "upload");
    if (type === "fetch") {
      if (options.fetch_format == null) {
        options.fetch_format = option_consume(options, "format");
      }
    }
    transformation = generate_transformation_string(options);
    resource_type = option_consume(options, "resource_type", "image");
    version = option_consume(options, "version");
    format = option_consume(options, "format");
    cloud_name = option_consume(options, "cloud_name", config().cloud_name);
    if (!cloud_name) {
      throw new Error("Unknown cloud_name");
    }
    private_cdn = option_consume(options, "private_cdn", config().private_cdn);
    secure_distribution = option_consume(options, "secure_distribution", config().secure_distribution);
    secure = option_consume(options, "secure", config().secure);
    cdn_subdomain = option_consume(options, "cdn_subdomain", config().cdn_subdomain);
    cname = option_consume(options, "cname", config().cname);
    shorten = option_consume(options, "shorten", config().shorten);
    if (secure_distribution == null) {
      secure_distribution = exports.SHARED_CDN;
    }
    if (public_id.match(/^https?:/)) {
      if (type === "upload" || type === "asset") {
        return public_id;
      }
      public_id = encodeURIComponent(public_id).replace(/%3A/g, ":").replace(/%2F/g, "/");
    } else if (format) {
      public_id += "." + format;
    }
    if (secure) {
      prefix = "https://" + secure_distribution;
    } else {
      subdomain = (cdn_subdomain ? "a" + ((crc32(public_id) % 5) + 1) + "." : "");
      host = cname != null ? cname : "" + (private_cdn ? "" + cloud_name + "-" : "") + "res.cloudinary.com";
      prefix = "http://" + subdomain + host;
    }
    if (!private_cdn || (secure && secure_distribution === exports.AKAMAI_SHARED_CDN)) {
      prefix += "/" + cloud_name;
    }
    if (shorten && resource_type === "image" && type === "upload") {
      resource_type = "iu";
      type = void 0;
    }
    if (public_id.search("/") >= 0 && !public_id.match(/^v[0-9]+/) && !public_id.match(/^https?:\//)) {
      if (version == null) {
        version = 1;
      }
    }
    url = [prefix, resource_type, type, transformation, (version ? "v" + version : ""), public_id].join("/");
    return url.replace(/([^:])\/+/g, "$1/");
  };

  html_only_attributes = function(options) {
    var height, width;
    width = option_consume(options, "html_width");
    height = option_consume(options, "html_height");
    if (width) {
      options["width"] = width;
    }
    if (height) {
      return options["height"] = height;
    }
  };

  utf8_encode = function(argString) {
    var c1, enc, end, n, start, string, stringl, utftext;
    if (argString == null) {
      return "";
    }
    string = argString + "";
    utftext = "";
    start = void 0;
    end = void 0;
    stringl = 0;
    start = end = 0;
    stringl = string.length;
    n = 0;
    while (n < stringl) {
      c1 = string.charCodeAt(n);
      enc = null;
      if (c1 < 128) {
        end++;
      } else if (c1 > 127 && c1 < 2048) {
        enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
      } else {
        enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
      }
      if (enc !== null) {
        if (end > start) {
          utftext += string.slice(start, end);
        }
        utftext += enc;
        start = end = n + 1;
      }
      n++;
    }
    if (end > start) {
      utftext += string.slice(start, stringl);
    }
    return utftext;
  };

  crc32 = function(str) {
    var crc, i, iTop, table, x, y;
    str = utf8_encode(str);
    table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
    crc = 0;
    x = 0;
    y = 0;
    crc = crc ^ (-1);
    i = 0;
    iTop = str.length;
    while (i < iTop) {
      y = (crc ^ str.charCodeAt(i)) & 0xFF;
      x = "0x" + table.substr(y * 9, 8);
      crc = (crc >>> 8) ^ x;
      i++;
    }
    crc = crc ^ (-1);
    if (crc < 0) {
      crc += 4294967296;
    }
    return crc;
  };

  exports.api_url = function(action, options) {
    var cloud_name, cloudinary, resource_type, _ref, _ref1, _ref2, _ref3;
    if (action == null) {
      action = 'upload';
    }
    if (options == null) {
      options = {};
    }
    cloudinary = (_ref = (_ref1 = options["upload_prefix"]) != null ? _ref1 : config().upload_prefix) != null ? _ref : "https://api.cloudinary.com";
    cloud_name = (function() {
      var _ref3;
      if ((_ref2 = (_ref3 = options["cloud_name"]) != null ? _ref3 : config().cloud_name) != null) {
        return _ref2;
      } else {
        throw new Error("Must supply cloud_name");
      }
    })();
    resource_type = (_ref3 = options["resource_type"]) != null ? _ref3 : "image";
    return [cloudinary, "v1_1", cloud_name, resource_type, action].join("/");
  };

  exports.random_public_id = function() {
    var generate_strip, public_id, strip;
    generate_strip = function(first, last) {
      return _.reduce(_.range(first.charCodeAt(0), last.charCodeAt(0) + 1), function(memo, charCode) {
        return memo + String.fromCharCode(charCode);
      }, '');
    };
    strip = generate_strip('a', 'z') + generate_strip('0', '9');
    public_id = '';
    _.times(12, function() {
      return public_id += strip[_.random(strip.length - 1)];
    });
    return public_id;
  };

  exports.signed_preloaded_image = function(result) {
    return "" + result.resource_type + "/upload/v" + result.version + "/" + (_.filter([result.public_id, result.format], present).join(".")) + "#" + result.signature;
  };

  exports.api_sign_request = function(params_to_sign, api_secret) {
    var k, to_sign, v;
    to_sign = _.sortBy((function() {
      var _results;
      _results = [];
      for (k in params_to_sign) {
        v = params_to_sign[k];
        if (v) {
          _results.push("" + k + "=" + (build_array(v).join(",")));
        }
      }
      return _results;
    })(), _.identity).join("&");
    return Ti.Utils.sha1(to_sign + api_secret);
  };

  exports.private_download_url = function(public_id, format, options) {
    var api_key, api_secret, k, params, v, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    api_key = (function() {
      var _ref1;
      if ((_ref = (_ref1 = options.api_key) != null ? _ref1 : config().api_key) != null) {
        return _ref;
      } else {
        throw new Error("Must supply api_key");
      }
    })();
    api_secret = (function() {
      var _ref2;
      if ((_ref1 = (_ref2 = options.api_secret) != null ? _ref2 : config().api_secret) != null) {
        return _ref1;
      } else {
        throw new Error("Must supply api_secret");
      }
    })();
    params = {
      timestamp: exports.timestamp(),
      public_id: public_id,
      format: format,
      type: options.type,
      attachment: options.attachment,
      expires_at: options.expires_at
    };
    for (k in params) {
      v = params[k];
      if (!exports.present(v)) {
        delete params[k];
      }
    }
    params.signature = exports.api_sign_request(params, api_secret);
    params.api_key = api_key;
    return exports.api_url("download", options) + "?" + exports.querystring.stringify(params);
  };

  exports.html_attrs = function(options) {
    var key, keys;
    keys = _.sortBy(_.keys(options), _.identity);
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        if (present(options[key])) {
          _results.push("" + key + "='" + options[key] + "'");
        }
      }
      return _results;
    })()).join(" ");
  };

  exports.querystring = {
    stringify: function(obj) {
      var key;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = _.keys(obj);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          if (present(obj[key])) {
            _results.push("" + (encodeURIComponent(key)) + "='" + (encodeURIComponent(obj[key])) + "'");
          }
        }
        return _results;
      })()).join("&");
    }
  };

}).call(this);
