describe "cloudinary_uploader", ->
  cloudinary = require '/lib/cloudinary'
  cloudinary.api = require 'admin_api'
  UPLOAD_TIMEOUT = 120*1000
  API_TIMEOUT = 60*1000
  #UPLOAD_TIMEOUT = API_TIMEOUT = 10*1000
  return console.log("JASMINE: **** Please setup environment for uploader test to run!") if !cloudinary.config().api_secret?
  beforeEach ->
    cloudinary.config(true)

  it "should successfully upload file", () ->
    result = undefined

    runs ->
      cloudinary.uploader.upload Ti.Filesystem.getFile("logo.png"), (result_) ->
        result = result_
      , timeout: UPLOAD_TIMEOUT

    waitsFor ->
      result
    , 'Upload should finish', UPLOAD_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      expect(result.width).toEqual(241)
      expect(result.height).toEqual(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).toEqual(expected_signature)

      public_id = result.public_id
      result = undefined
      cloudinary.uploader.destroy public_id, (result_) ->
        result = result_
      , timeout: API_TIMEOUT

    waitsFor ->
      result
    , 'Delete should finish', API_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      expect(result.result).toEqual("ok")

  it "should successfully upload url", () ->
    result = undefined
    runs ->
      cloudinary.uploader.upload "http://cloudinary.com/images/logo.png", (result_) ->
        result = result_
      , timeout: UPLOAD_TIMEOUT

    waitsFor ->
      result
    , UPLOAD_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      expect(result.width).toEqual(241)
      expect(result.height).toEqual(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).toEqual(expected_signature)

  it "should successfully rename a file", ->
    result = undefined

    runs ->
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result = result_
      , timeout: UPLOAD_TIMEOUT
    
    waitsFor ->
      result
    , UPLOAD_TIMEOUT

    public_id = new_public_id = undefined
    runs ->
      expect(result.error).toBe undefined
      public_id = result.public_id
      new_public_id = public_id + "2"
      result = undefined
      cloudinary.uploader.rename public_id, new_public_id, (result_) ->
        result = result_
      , timeout: API_TIMEOUT

    waitsFor ->
      result
    , API_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      result = undefined
      cloudinary.api.resource new_public_id, (result_) ->
        result = result_
      , timeout: API_TIMEOUT

    waitsFor ->
      result
    , API_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      result = undefined
      cloudinary.uploader.upload "spec/favicon.ico", (result_) ->
        result = result_
      , timeout: UPLOAD_TIMEOUT

    waitsFor ->
      result
    , UPLOAD_TIMEOUT

    public_id2 = undefined
    runs ->
      expect(result.error).toBe undefined
      public_id2 = result.public_id
      result = undefined
      cloudinary.uploader.rename public_id2, new_public_id, (result_) ->
        result = result_
      , timeout: API_TIMEOUT

    waitsFor ->
      result
    , API_TIMEOUT

    runs ->
      expect(result.error).not.toBe undefined
      result = undefined
      cloudinary.uploader.rename public_id2, new_public_id, (result_) ->
        result = result_
      ,
        overwrite: true
        timeout: API_TIMEOUT

    waitsFor ->
      result
    , API_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      result = undefined
      cloudinary.api.resource new_public_id, (result_) ->
        result = result_
      , timeout: API_TIMEOUT

    waitsFor ->
      result
    , API_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      expect(result.format).toEqual "ico"

  it "should successfully call explicit api", ->
    result = undefined
    runs ->
      cloudinary.uploader.explicit "cloudinary", (result_) ->
        result = result_
      ,
        timeout: UPLOAD_TIMEOUT
        type: "twitter_name"
        eager: [crop: "scale", width: 2.0]

    waitsFor ->
      result
    , UPLOAD_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      url = cloudinary.utils.url("cloudinary", type: "twitter_name", crop: "scale", width: 2.0, format: "png", version: result["version"])
      expect(result.eager[0].url).toEqual(url)

  it "should support eager in upload", ->
    result = undefined
    runs ->
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result = result_
      ,
        timeout: UPLOAD_TIMEOUT
        eager: [crop: "scale", width: 2.0]

    waitsFor ->
      result
    , UPLOAD_TIMEOUT

    runs ->
      expect(result.error).toBe undefined

  it "should support custom headers in upload", ->
    result = undefined
    runs ->
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result = result_
      ,
        timeout: UPLOAD_TIMEOUT
        headers: ["Link: 1"]

    waitsFor ->
      result
    , UPLOAD_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      result = undefined
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result = result_
      ,
        timeout: UPLOAD_TIMEOUT
        headers: {Link: "1"}

    waitsFor ->
      result
    , UPLOAD_TIMEOUT

    runs ->
      expect(result.error).toBe undefined

  it  "should successfully generate text image", ->
    result = undefined
    runs ->
      cloudinary.uploader.text "hello world", (result_) ->
        result = result_
      , timeout: UPLOAD_TIMEOUT

    waitsFor ->
      result
    , UPLOAD_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      expect(result.width).toBeGreaterThan 50
      expect(result.width).toBeLessThan 70
      expect(result.height).toBeGreaterThan 5
      expect(result.height).toBeLessThan 15

      ###
  it "should successfully upload stream", ->
    this.timeout 5000
    stream = cloudinary.uploader.upload_stream (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.width).toEqual(241)
      expect(result.height).toEqual(51)
      expected_signature = cloudinary.utils.api_sign_request({public_id: result.public_id, version: result.version}, cloudinary.config().api_secret)
      expect(result.signature).toEqual(expected_signature)
      done()
    file_reader = fs.createReadStream('spec/logo.png', {encoding: 'binary'});
    file_reader.on 'data', stream.write
    file_reader.on 'end', stream.end
    ###

  it "should successfully manipulate tags", ->
    result1 = undefined
    runs ->
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result1 = result_
      , timeout: UPLOAD_TIMEOUT

    waitsFor (-> result1) , UPLOAD_TIMEOUT
    result2 = undefined
    runs ->
      expect(result1.error).toBe undefined
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result2 = result_
      , timeout: UPLOAD_TIMEOUT

    waitsFor (-> result2) , UPLOAD_TIMEOUT
    resultX = undefined
    runs ->
      expect(result2.error).toBe undefined

      cloudinary.uploader.add_tag "tag1", [result1.public_id, result2.public_id], (result_) ->
        resultX = result_
      , timeout: API_TIMEOUT

    waitsFor (-> resultX) , API_TIMEOUT
    runs ->
      expect(resultX.error).toBe undefined

      resultX = undefined
      cloudinary.api.resource result2.public_id, (result_) ->
        resultX = result_
      , timeout: API_TIMEOUT


    waitsFor (-> resultX) , API_TIMEOUT
    runs ->
      expect(resultX.error).toBe undefined
      expect(resultX.tags).toEqual(["tag1"])

      resultX = undefined
      cloudinary.uploader.add_tag "tag2", result1.public_id, (result_) ->
        resultX = result_
      , timeout: API_TIMEOUT


    waitsFor (-> resultX) , API_TIMEOUT
    runs ->
      expect(resultX.error).toBe undefined

      resultX = undefined
      cloudinary.api.resource result1.public_id, (result_) ->
        resultX = result_
      , timeout: API_TIMEOUT


    waitsFor (-> resultX) , API_TIMEOUT
    runs ->
      expect(resultX.error).toBe undefined
      expect(resultX.tags).toEqual(["tag1", "tag2"])

      resultX = undefined
      cloudinary.uploader.remove_tag "tag1", result1.public_id, (result_) ->
        resultX = result_
      , timeout: API_TIMEOUT


    waitsFor (-> resultX) , API_TIMEOUT
    runs ->
      expect(resultX.error).toBe undefined

      resultX = undefined
      cloudinary.api.resource result1.public_id, (result_) ->
        resultX = result_
      , timeout: API_TIMEOUT


    waitsFor (-> resultX) , API_TIMEOUT
    runs ->
      expect(resultX.error).toBe undefined
      expect(resultX.tags).toEqual(["tag2"])
    
      resultX = undefined
      cloudinary.uploader.replace_tag "tag3", result1.public_id, (result_) ->
        resultX = result_
      , timeout: API_TIMEOUT

    waitsFor (-> resultX) , API_TIMEOUT
    runs ->
      expect(resultX.error).toBe undefined

      resultX = undefined
      cloudinary.api.resource result1.public_id, (result_) ->
        resultX = result_
      , timeout: API_TIMEOUT

    waitsFor (-> resultX) , API_TIMEOUT
    runs ->
      expect(resultX.error).toBe undefined
      expect(resultX.tags).toEqual(["tag3"])
