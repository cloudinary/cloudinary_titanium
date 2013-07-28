(function() {

  describe("cloudinary_uploader", function() {
    var API_TIMEOUT, UPLOAD_TIMEOUT, cloudinary;
    cloudinary = require('/lib/cloudinary');
    UPLOAD_TIMEOUT = 120 * 1000;
    API_TIMEOUT = 60 * 1000;
    if (!(cloudinary.config().api_secret != null)) {
      return console.log("JASMINE: **** Please setup environment for uploader test to run!");
    }
    beforeEach(function() {
      return cloudinary.config(true);
    });
    it("should successfully upload file", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.upload(Ti.Filesystem.getFile("logo.png"), function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, 'Upload should finish', UPLOAD_TIMEOUT);
      runs(function() {
        var expected_signature, public_id;
        expect(result.error).toBe(void 0);
        expect(result.width).toEqual(241);
        expect(result.height).toEqual(51);
        expected_signature = cloudinary.utils.api_sign_request({
          public_id: result.public_id,
          version: result.version
        }, cloudinary.config().api_secret);
        expect(result.signature).toEqual(expected_signature);
        public_id = result.public_id;
        result = void 0;
        return cloudinary.uploader.destroy(public_id, function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, 'Delete should finish', API_TIMEOUT);
      return runs(function() {
        expect(result.error).toBe(void 0);
        return expect(result.result).toEqual("ok");
      });
    });
    it("should successfully upload url", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.upload("http://cloudinary.com/images/logo.png", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, UPLOAD_TIMEOUT);
      return runs(function() {
        var expected_signature;
        expect(result.error).toBe(void 0);
        expect(result.width).toEqual(241);
        expect(result.height).toEqual(51);
        expected_signature = cloudinary.utils.api_sign_request({
          public_id: result.public_id,
          version: result.version
        }, cloudinary.config().api_secret);
        return expect(result.signature).toEqual(expected_signature);
      });
    });
    it("should successfully rename a file", function() {
      var new_public_id, public_id, public_id2, result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, UPLOAD_TIMEOUT);
      public_id = new_public_id = void 0;
      runs(function() {
        expect(result.error).toBe(void 0);
        public_id = result.public_id;
        new_public_id = public_id + "2";
        result = void 0;
        return cloudinary.uploader.rename(public_id, new_public_id, function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, API_TIMEOUT);
      runs(function() {
        expect(result.error).toBe(void 0);
        result = void 0;
        return cloudinary.api.resource(new_public_id, function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, API_TIMEOUT);
      runs(function() {
        expect(result.error).toBe(void 0);
        result = void 0;
        return cloudinary.uploader.upload("spec/favicon.ico", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, UPLOAD_TIMEOUT);
      public_id2 = void 0;
      runs(function() {
        expect(result.error).toBe(void 0);
        public_id2 = result.public_id;
        result = void 0;
        return cloudinary.uploader.rename(public_id2, new_public_id, function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, API_TIMEOUT);
      runs(function() {
        expect(result.error).not.toBe(void 0);
        result = void 0;
        return cloudinary.uploader.rename(public_id2, new_public_id, function(result_) {
          return result = result_;
        }, {
          overwrite: true,
          timeout: API_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, API_TIMEOUT);
      runs(function() {
        expect(result.error).toBe(void 0);
        result = void 0;
        return cloudinary.api.resource(new_public_id, function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, API_TIMEOUT);
      return runs(function() {
        expect(result.error).toBe(void 0);
        return expect(result.format).toEqual("ico");
      });
    });
    it("should successfully call explicit api", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.explicit("cloudinary", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT,
          type: "twitter_name",
          eager: [
            {
              crop: "scale",
              width: 2.0
            }
          ]
        });
      });
      waitsFor(function() {
        return result;
      }, UPLOAD_TIMEOUT);
      return runs(function() {
        var url;
        expect(result.error).toBe(void 0);
        url = cloudinary.utils.url("cloudinary", {
          type: "twitter_name",
          crop: "scale",
          width: 2.0,
          format: "png",
          version: result["version"]
        });
        return expect(result.eager[0].url).toEqual(url);
      });
    });
    it("should support eager in upload", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT,
          eager: [
            {
              crop: "scale",
              width: 2.0
            }
          ]
        });
      });
      waitsFor(function() {
        return result;
      }, UPLOAD_TIMEOUT);
      return runs(function() {
        return expect(result.error).toBe(void 0);
      });
    });
    it("should support custom headers in upload", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT,
          headers: ["Link: 1"]
        });
      });
      waitsFor(function() {
        return result;
      }, UPLOAD_TIMEOUT);
      runs(function() {
        expect(result.error).toBe(void 0);
        result = void 0;
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT,
          headers: {
            Link: "1"
          }
        });
      });
      waitsFor(function() {
        return result;
      }, UPLOAD_TIMEOUT);
      return runs(function() {
        return expect(result.error).toBe(void 0);
      });
    });
    it("should successfully generate text image", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.text("hello world", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT
        });
      });
      waitsFor(function() {
        return result;
      }, UPLOAD_TIMEOUT);
      return runs(function() {
        expect(result.error).toBe(void 0);
        expect(result.width).toBeGreaterThan(50);
        expect(result.width).toBeLessThan(70);
        expect(result.height).toBeGreaterThan(5);
        return expect(result.height).toBeLessThan(15);
        /*
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
        */

      });
    });
    return it("should successfully manipulate tags", function() {
      var result1, result2, resultX;
      result1 = void 0;
      runs(function() {
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result1 = result_;
        }, {
          timeout: UPLOAD_TIMEOUT
        });
      });
      waitsFor((function() {
        return result1;
      }), UPLOAD_TIMEOUT);
      result2 = void 0;
      runs(function() {
        expect(result1.error).toBe(void 0);
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result2 = result_;
        }, {
          timeout: UPLOAD_TIMEOUT
        });
      });
      waitsFor((function() {
        return result2;
      }), UPLOAD_TIMEOUT);
      resultX = void 0;
      runs(function() {
        expect(result2.error).toBe(void 0);
        return cloudinary.uploader.add_tag("tag1", [result1.public_id, result2.public_id], function(result_) {
          return resultX = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return resultX;
      }), API_TIMEOUT);
      runs(function() {
        expect(resultX.error).toBe(void 0);
        resultX = void 0;
        return cloudinary.api.resource(result2.public_id, function(result_) {
          return resultX = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return resultX;
      }), API_TIMEOUT);
      runs(function() {
        expect(resultX.error).toBe(void 0);
        expect(resultX.tags).toEqual(["tag1"]);
        resultX = void 0;
        return cloudinary.uploader.add_tag("tag2", result1.public_id, function(result_) {
          return resultX = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return resultX;
      }), API_TIMEOUT);
      runs(function() {
        expect(resultX.error).toBe(void 0);
        resultX = void 0;
        return cloudinary.api.resource(result1.public_id, function(result_) {
          return resultX = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return resultX;
      }), API_TIMEOUT);
      runs(function() {
        expect(resultX.error).toBe(void 0);
        expect(resultX.tags).toEqual(["tag1", "tag2"]);
        resultX = void 0;
        return cloudinary.uploader.remove_tag("tag1", result1.public_id, function(result_) {
          return resultX = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return resultX;
      }), API_TIMEOUT);
      runs(function() {
        expect(resultX.error).toBe(void 0);
        resultX = void 0;
        return cloudinary.api.resource(result1.public_id, function(result_) {
          return resultX = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return resultX;
      }), API_TIMEOUT);
      runs(function() {
        expect(resultX.error).toBe(void 0);
        expect(resultX.tags).toEqual(["tag2"]);
        resultX = void 0;
        return cloudinary.uploader.replace_tag("tag3", result1.public_id, function(result_) {
          return resultX = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return resultX;
      }), API_TIMEOUT);
      runs(function() {
        expect(resultX.error).toBe(void 0);
        resultX = void 0;
        return cloudinary.api.resource(result1.public_id, function(result_) {
          return resultX = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return resultX;
      }), API_TIMEOUT);
      return runs(function() {
        expect(resultX.error).toBe(void 0);
        return expect(resultX.tags).toEqual(["tag3"]);
      });
    });
  });

}).call(this);
