cloudinary_config = undefined
base_cloudinary_config = require('../cloudinary_config').config

module.exports = (new_config, new_value) ->
  if !cloudinary_config? || new_config == true
    cloudinary_url = Ti.App.Properties.getString('CLOUDINARY_URL')
    if cloudinary_url?
      uri = require('url').parse(cloudinary_url)
      cloudinary_config =
        cloud_name: uri.host,
        api_key: uri.auth and uri.auth.split(":")[0],
        api_secret: uri.auth and uri.auth.split(":")[1],
        private_cdn: uri.pathname?,
        secure_distribution: uri.pathname and uri.pathname.substring(1)
      if uri.query?
        for k, v of require("querystring").parse(uri.query)
          cloudinary_config[k] = v
    else
      try
        cloudinary_config = _.clone base_cloudinary_config
      catch err
        console.log("Couldn't find configuration file 'cloudinary_config.js'")
        cloudinary_config = {}
  if not _.isUndefined(new_value)
    cloudinary_config[new_config] = new_value
  else if _.isString(new_config)
    return cloudinary_config[new_config]
  else if _.isObject(new_config)
    cloudinary_config = new_config
  cloudinary_config
