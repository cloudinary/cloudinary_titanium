describe "cloudinary_uploader", ->
  cloudinary = require '/lib/cloudinary'

  find_by_attr = (elements, attr, value) ->
    for element in elements
      return element if element[attr] == value
    undefined

  UPLOAD_TIMEOUT = 120*1000
  API_TIMEOUT = 60*1000
  #UPLOAD_TIMEOUT = API_TIMEOUT = 10*1000
  return console.log("JASMINE: **** Please setup environment for uploader test to run!") if !cloudinary.config().api_secret?
  beforeEach ->
    cloudinary.config(true)
    semaphore = 3
    progress = -> semaphore -= 1
    runs ->
      cloudinary.uploader.destroy "api_test", ->
        cloudinary.uploader.destroy "api_test2", ->
          cloudinary.uploader.upload "spec/logo.png", progress,
            public_id: "api_test"
            tags: "api_test_tag"
            eager: [width: 100, crop: "scale"]
          cloudinary.uploader.upload "spec/logo.png", progress,
            public_id: "api_test2"
            tags: "api_test_tag"
            eager: [width: 100, crop: "scale"]
          cloudinary.api.delete_transformation "api_test_transformation", progress

    waitsFor (-> semaphore == 0), 'setup should finish', UPLOAD_TIMEOUT

  xit "should allow listing resource_types", ->
    result = undefined
    runs ->
      cloudinary.api.resource_types (result_) ->
        result = result_
      , timeout: API_TIMEOUT

    waitsFor ( -> result), 'resource_types should finish', API_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      expect(result.resource_types).toContain "image"

  xit "should allow listing resources", ->
    result = undefined
    runs ->
      cloudinary.api.resources (result_) ->
        result = result_
      , timeout: API_TIMEOUT

    waitsFor ( -> result), 'resources should finish', API_TIMEOUT

    runs ->
      expect(result.error).toBe undefined
      resource = find_by_attr(result.resources, "public_id", "api_test")
      expect(resource).not.toBe undefined
      expect(resource.type).toEqual "upload"

  xit "should allow listing resources with cursor", ->
    result = undefined
    runs ->
      cloudinary.api.resources (result_) ->
        result = result_
      ,
        timeout: API_TIMEOUT
        max_results: 1

    waitsFor ( -> result), 'resources should finish', API_TIMEOUT
    result2 = undefined
    runs ->
      expect(result.error).toBe undefined
      expect(result.resources.length).toEqual 1
      expect(result.next_cursor).not.toBe undefined

      cloudinary.api.resources (result_) ->
        result2 = result_
      ,
        timeout: API_TIMEOUT
        max_results: 1
        next_cursor: result.next_cursor

    waitsFor ( -> result2), 'resources should finish', API_TIMEOUT
    runs ->
      expect(result2.error).toBe undefined
      expect(result2.resources.length).toEqual 1
      expect(result2.next_cursor).not.toBe undefined
      expect(result2.resources[0].public_id).not.toBe undefined
      expect(result.resources[0].public_id).not.toEqual result2.resources[0].public_id

  xit "should allow listing resources by type", ->
    result = undefined
    runs ->
      cloudinary.api.resources (result_) ->
        result = result_
      ,
        timeout: API_TIMEOUT
        type: "upload"

    waitsFor ( -> result), 'resources should finish', API_TIMEOUT
    runs ->
      expect(result.error).toBe undefined
      resource = find_by_attr(result.resources, "public_id", "api_test")
      expect(resource).not.toBe undefined
      expect(resource.type).toEqual "upload"

  xit "should allow listing resources by prefix", ->
    result = undefined
    runs ->
      cloudinary.api.resources (result_) ->
        result = result_
      ,
        timeout: API_TIMEOUT
        type: "upload"
        prefix: "api_test"

    waitsFor ( -> result), 'resources should finish', API_TIMEOUT
    runs ->
      expect(result.error).toBe undefined
      public_ids = (resource.public_id for resource in result.resources)
      expect(public_ids).toContain "api_test"
      expect(public_ids).toContain "api_test2"

  xit "should allow listing resources by tag", ->
    result = undefined
    runs ->
      cloudinary.api.resources_by_tag "api_test_tag", (result_) ->
        result = result_
      ,
        timeout: API_TIMEOUT
        type: "upload"
        prefix: "api_test"

    waitsFor ( -> result), 'resources_by_tag should finish', API_TIMEOUT
    runs ->
      expect(result.error).toBe undefined
      resource = find_by_attr(result.resources, "public_id", "api_test")
      expect(resource).not.toBe undefined
      expect(resource.type).toEqual "upload"

  xit "should allow get resource metadata", ->
    resource = undefined
    runs ->
      cloudinary.api.resource "api_test", (result_) ->
        resource = result_
      ,
        timeout: API_TIMEOUT
        type: "upload"
        prefix: "api_test"

    waitsFor ( -> resource), 'resource should finish', API_TIMEOUT
    runs ->
      expect(resource).not.toBe undefined
      expect(resource.error).toBe undefined
      expect(resource.public_id).toEqual "api_test"
      expect(resource.bytes).toEqual 3381
      expect(resource.derived.length).toEqual 1

  it "should allow deleting derived resource", (done) ->
    result = undefined
    runs ->
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result = result_
      ,
        timeout: UPLOAD_TIMEOUT
        public_id: "api_test3"
        eager: [width: 101, crop: "scale"]

    waitsFor ( -> result), 'upload should finish', UPLOAD_TIMEOUT
    resource = undefined
    runs ->
      expect(result.error).toBe undefined
      cloudinary.api.resource "api_test3", (result_) ->
        resource = result_

    waitsFor ( -> resource), 'resource should finish', API_TIMEOUT
    derived_resource_id = undefined
    runs ->
      expect(resource).not.toBe undefined
      expect(resource.bytes).toEqual 3381
      expect(resource.derived.length).toEqual 1
      derived_resource_id = resource.derived[0].id
      result = undefined
      cloudinary.api.delete_derived_resources derived_resource_id, (result_) ->
        result = result_

    waitsFor ( -> result), 'delete_derived_resources should finish', API_TIMEOUT
    derived_resource_id = undefined
    runs ->
      expect(result.error).toBe undefined
      resource = undefined
      cloudinary.api.resource "api_test3", (result_) ->
        resource = result_

    waitsFor ( -> resource), 'resource should finish', API_TIMEOUT
    runs ->
      expect(resource).not.toBe undefined
      expect(resource.derived.length).toEqual 0

  xit "should allow deleting resources", (done) ->
    result = undefined
    runs ->
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result = result_
      ,
        timeout: UPLOAD_TIMEOUT
        public_id: "api_test3"

    waitsFor ( -> result), 'upload should finish', UPLOAD_TIMEOUT
    runs ->
      expect(result.error).toBe undefined
      result = undefined
      cloudinary.api.resource "api_test3", (result_) ->
        result = result_

    waitsFor ( -> result), 'resource should finish', API_TIMEOUT
    runs ->
      expect(result).not.toBe undefined
      result = undefined
      cloudinary.api.delete_resources ["apit_test", "api_test2", "api_test3"], () ->
        cloudinary.api.resource "api_test3", (result) ->
          result = result_

    waitsFor ( -> result), 'resource should finish', API_TIMEOUT
    runs ->
      expect(result).not.toBe undefined
      expect(result.error.http_code).toEqual 404

  xit "should allow deleting resources by prefix", (done) ->
    result = undefined
    runs ->
      cloudinary.uploader.upload "spec/logo.png", (result_) ->
        result = result_
      ,
        timeout: UPLOAD_TIMEOUT
        public_id: "api_test_by_prefix"

    waitsFor ( -> result), 'upload should finish', UPLOAD_TIMEOUT
    resource = undefined
    runs ->
      expect(result.error).toBe undefined
      cloudinary.api.resource "api_test_by_prefix", (result_) ->
        resource = result_

    waitsFor ( -> resource), 'resource should finish', API_TIMEOUT
    runs ->
      expect(resource).not.toBe undefined
      result = undefined
      cloudinary.api.delete_resources_by_prefix "api_test_by", (result_) ->
        result = result_

    waitsFor ( -> result), 'delete_resources_by_prefix should finish', API_TIMEOUT
    runs ->
      expect(result.error).toBe undefined
      cloudinary.api.resource "api_test_by_prefix", (result_) ->
        result = result_

    waitsFor ( -> result), 'resource should finish', API_TIMEOUT
    runs ->
      expect(result.error).toBe undefined
      expect(result.error.http_code).toEqual 404

  return

  it "should allow deleting resources by tags", (done) ->
    @timeout 10000
    cloudinary.uploader.upload("spec/logo.png", (r) ->
      return done(new Error r.error.message) if r.error?
      cloudinary.api.resource "api_test4", (resource) ->
        expect(resource).not.toEqual(undefined)
        cloudinary.api.delete_resources_by_tag "api_test_tag_for_delete", (rr) ->
          return done(new Error rr.error.message) if rr.error?
          cloudinary.api.resource "api_test4", (result) ->
            expect(result.error).not.to.be undefined
            expect(result.error.http_code).toEqual 404
            done()
    , public_id: "api_test4", tags: ["api_test_tag_for_delete"])

  it "should allow listing tags", (done) ->
    @timeout 10000
    cloudinary.api.tags (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.tags).toContain("api_test_tag")
      done()

  it "should allow listing tag by prefix ", (done) ->
    @timeout 10000
    cloudinary.api.tags (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.tags).toContain("api_test_tag")
      done()
    , prefix: "api_test"

  it "should allow listing tag by prefix if not found", (done) ->
    @timeout 10000
    cloudinary.api.tags (result) ->
      return done(new Error result.error.message) if result.error?
      expect(result.tags).to.have.length 0
      done()
    , prefix: "api_test_no_such_tag"

  it "should allow listing transformations", (done) ->
    @timeout 10000
    cloudinary.api.transformations (result) ->
      return done(new Error result.error.message) if result.error?
      transformation = find_by_attr(result.transformations, "name", "c_scale,w_100")
      expect(transformation).not.toEqual(undefined)
      expect(transformation.used).to.be.ok
      done()

  it "should allow getting transformation metadata", (done) ->
    @timeout 10000
    cloudinary.api.transformation "c_scale,w_100", (transformation) ->
      expect(transformation).not.toEqual(undefined)
      expect(transformation.info).toEqual([crop: "scale", width: 100])
      done()

  it "should allow getting transformation metadata by info", (done) ->
    @timeout 10000
    cloudinary.api.transformation {crop: "scale", width: 100}, (transformation) ->
      expect(transformation).not.toEqual(undefined)
      expect(transformation.info).toEqual([crop: "scale", width: 100])
      done()

  it "should allow updating transformation allowed_for_strict", (done) ->
    @timeout 10000
    cloudinary.api.update_transformation "c_scale,w_100", {allowed_for_strict: true}, () ->
      cloudinary.api.transformation "c_scale,w_100", (transformation) ->
        expect(transformation).not.toEqual(undefined)
        expect(transformation.allowed_for_strict).to.be.ok
        cloudinary.api.update_transformation "c_scale,w_100", {allowed_for_strict: false}, () ->
          cloudinary.api.transformation "c_scale,w_100", (transformation) ->
            expect(transformation).not.toEqual(undefined)
            expect(transformation.allowed_for_strict).not.to.be.ok
            done()

  it "should allow creating named transformation", (done) ->
    @timeout 10000
    cloudinary.api.create_transformation "api_test_transformation", {crop: "scale", width: 102}, () ->
      cloudinary.api.transformation "api_test_transformation", (transformation) ->
        expect(transformation).not.toEqual(undefined)
        expect(transformation.allowed_for_strict).to.be.ok
        expect(transformation.info).toEqual([crop: "scale", width: 102])
        expect(transformation.used).not.to.be.ok
        done()

  it "should allow unsafe update of named transformation", (done) ->
    @timeout 10000
    cloudinary.api.create_transformation "api_test_transformatio3", {crop: "scale", width: 102}, () ->
      cloudinary.api.update_transformation "api_test_transformation3", {unsafe_update: {crop: "scale", width: 103}}, () ->
        cloudinary.api.transformation "api_test_transformation3", (transformation) ->
          expect(transformation).not.toEqual(undefined)
          expect(transformation.info).toEqual([crop: "scale", width: 103])
          expect(transformation.used).not.to.be.ok
          done()

  it "should allow deleting named transformation", (done) ->
    @timeout 10000
    cloudinary.api.delete_transformation "api_test_transformation", () ->
      cloudinary.api.transformation "api_test_transformation", (transformation) ->
        expect(transformation.error.http_code).toEqual 404
        done()

  it "should allow deleting implicit transformation", (done) ->
    @timeout 10000
    cloudinary.api.transformation "c_scale,w_100", (transformation) ->
      expect(transformation).not.toEqual(undefined)
      cloudinary.api.delete_transformation "c_scale,w_100", () ->
        cloudinary.api.transformation "c_scale,w_100", (transformation) ->
          expect(transformation.error.http_code).toEqual 404
          done()

  it "should support the usage API call", (done) ->
    @timeout 10000
    cloudinary.api.usage (usage) ->
      expect(usage.last_update).not.toEqual null
      done()


