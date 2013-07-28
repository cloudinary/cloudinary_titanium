(function() {

  describe("cloudinary_uploader", function() {
    var API_TIMEOUT, UPLOAD_TIMEOUT, cloudinary, find_by_attr;
    cloudinary = require('/lib/cloudinary');
    find_by_attr = function(elements, attr, value) {
      var element, _i, _len;
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        if (element[attr] === value) {
          return element;
        }
      }
      return void 0;
    };
    UPLOAD_TIMEOUT = 120 * 1000;
    API_TIMEOUT = 60 * 1000;
    if (!(cloudinary.config().api_secret != null)) {
      return console.log("JASMINE: **** Please setup environment for uploader test to run!");
    }
    beforeEach(function() {
      var progress, semaphore;
      cloudinary.config(true);
      semaphore = 3;
      progress = function() {
        return semaphore -= 1;
      };
      runs(function() {
        return cloudinary.uploader.destroy("api_test", function() {
          return cloudinary.uploader.destroy("api_test2", function() {
            cloudinary.uploader.upload("spec/logo.png", progress, {
              public_id: "api_test",
              tags: "api_test_tag",
              eager: [
                {
                  width: 100,
                  crop: "scale"
                }
              ]
            });
            cloudinary.uploader.upload("spec/logo.png", progress, {
              public_id: "api_test2",
              tags: "api_test_tag",
              eager: [
                {
                  width: 100,
                  crop: "scale"
                }
              ]
            });
            return cloudinary.api.delete_transformation("api_test_transformation", progress);
          });
        });
      });
      return waitsFor((function() {
        return semaphore === 0;
      }), 'setup should finish', UPLOAD_TIMEOUT);
    });
    xit("should allow listing resource_types", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.api.resource_types(function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return result;
      }), 'resource_types should finish', API_TIMEOUT);
      return runs(function() {
        expect(result.error).toBe(void 0);
        return expect(result.resource_types).toContain("image");
      });
    });
    xit("should allow listing resources", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.api.resources(function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT
        });
      });
      waitsFor((function() {
        return result;
      }), 'resources should finish', API_TIMEOUT);
      return runs(function() {
        var resource;
        expect(result.error).toBe(void 0);
        resource = find_by_attr(result.resources, "public_id", "api_test");
        expect(resource).not.toBe(void 0);
        return expect(resource.type).toEqual("upload");
      });
    });
    xit("should allow listing resources with cursor", function() {
      var result, result2;
      result = void 0;
      runs(function() {
        return cloudinary.api.resources(function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT,
          max_results: 1
        });
      });
      waitsFor((function() {
        return result;
      }), 'resources should finish', API_TIMEOUT);
      result2 = void 0;
      runs(function() {
        expect(result.error).toBe(void 0);
        expect(result.resources.length).toEqual(1);
        expect(result.next_cursor).not.toBe(void 0);
        return cloudinary.api.resources(function(result_) {
          return result2 = result_;
        }, {
          timeout: API_TIMEOUT,
          max_results: 1,
          next_cursor: result.next_cursor
        });
      });
      waitsFor((function() {
        return result2;
      }), 'resources should finish', API_TIMEOUT);
      return runs(function() {
        expect(result2.error).toBe(void 0);
        expect(result2.resources.length).toEqual(1);
        expect(result2.next_cursor).not.toBe(void 0);
        expect(result2.resources[0].public_id).not.toBe(void 0);
        return expect(result.resources[0].public_id).not.toEqual(result2.resources[0].public_id);
      });
    });
    xit("should allow listing resources by type", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.api.resources(function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT,
          type: "upload"
        });
      });
      waitsFor((function() {
        return result;
      }), 'resources should finish', API_TIMEOUT);
      return runs(function() {
        var resource;
        expect(result.error).toBe(void 0);
        resource = find_by_attr(result.resources, "public_id", "api_test");
        expect(resource).not.toBe(void 0);
        return expect(resource.type).toEqual("upload");
      });
    });
    xit("should allow listing resources by prefix", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.api.resources(function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT,
          type: "upload",
          prefix: "api_test"
        });
      });
      waitsFor((function() {
        return result;
      }), 'resources should finish', API_TIMEOUT);
      return runs(function() {
        var public_ids, resource;
        expect(result.error).toBe(void 0);
        public_ids = (function() {
          var _i, _len, _ref, _results;
          _ref = result.resources;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            resource = _ref[_i];
            _results.push(resource.public_id);
          }
          return _results;
        })();
        expect(public_ids).toContain("api_test");
        return expect(public_ids).toContain("api_test2");
      });
    });
    xit("should allow listing resources by tag", function() {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.api.resources_by_tag("api_test_tag", function(result_) {
          return result = result_;
        }, {
          timeout: API_TIMEOUT,
          type: "upload",
          prefix: "api_test"
        });
      });
      waitsFor((function() {
        return result;
      }), 'resources_by_tag should finish', API_TIMEOUT);
      return runs(function() {
        var resource;
        expect(result.error).toBe(void 0);
        resource = find_by_attr(result.resources, "public_id", "api_test");
        expect(resource).not.toBe(void 0);
        return expect(resource.type).toEqual("upload");
      });
    });
    xit("should allow get resource metadata", function() {
      var resource;
      resource = void 0;
      runs(function() {
        return cloudinary.api.resource("api_test", function(result_) {
          return resource = result_;
        }, {
          timeout: API_TIMEOUT,
          type: "upload",
          prefix: "api_test"
        });
      });
      waitsFor((function() {
        return resource;
      }), 'resource should finish', API_TIMEOUT);
      return runs(function() {
        expect(resource).not.toBe(void 0);
        expect(resource.error).toBe(void 0);
        expect(resource.public_id).toEqual("api_test");
        expect(resource.bytes).toEqual(3381);
        return expect(resource.derived.length).toEqual(1);
      });
    });
    it("should allow deleting derived resource", function(done) {
      var derived_resource_id, resource, result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT,
          public_id: "api_test3",
          eager: [
            {
              width: 101,
              crop: "scale"
            }
          ]
        });
      });
      waitsFor((function() {
        return result;
      }), 'upload should finish', UPLOAD_TIMEOUT);
      resource = void 0;
      runs(function() {
        expect(result.error).toBe(void 0);
        return cloudinary.api.resource("api_test3", function(result_) {
          return resource = result_;
        });
      });
      waitsFor((function() {
        return resource;
      }), 'resource should finish', API_TIMEOUT);
      derived_resource_id = void 0;
      runs(function() {
        expect(resource).not.toBe(void 0);
        expect(resource.bytes).toEqual(3381);
        expect(resource.derived.length).toEqual(1);
        derived_resource_id = resource.derived[0].id;
        result = void 0;
        return cloudinary.api.delete_derived_resources(derived_resource_id, function(result_) {
          return result = result_;
        });
      });
      waitsFor((function() {
        return result;
      }), 'delete_derived_resources should finish', API_TIMEOUT);
      derived_resource_id = void 0;
      runs(function() {
        expect(result.error).toBe(void 0);
        resource = void 0;
        return cloudinary.api.resource("api_test3", function(result_) {
          return resource = result_;
        });
      });
      waitsFor((function() {
        return resource;
      }), 'resource should finish', API_TIMEOUT);
      return runs(function() {
        expect(resource).not.toBe(void 0);
        return expect(resource.derived.length).toEqual(0);
      });
    });
    xit("should allow deleting resources", function(done) {
      var result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT,
          public_id: "api_test3"
        });
      });
      waitsFor((function() {
        return result;
      }), 'upload should finish', UPLOAD_TIMEOUT);
      runs(function() {
        expect(result.error).toBe(void 0);
        result = void 0;
        return cloudinary.api.resource("api_test3", function(result_) {
          return result = result_;
        });
      });
      waitsFor((function() {
        return result;
      }), 'resource should finish', API_TIMEOUT);
      runs(function() {
        expect(result).not.toBe(void 0);
        result = void 0;
        return cloudinary.api.delete_resources(["apit_test", "api_test2", "api_test3"], function() {
          return cloudinary.api.resource("api_test3", function(result) {
            return result = result_;
          });
        });
      });
      waitsFor((function() {
        return result;
      }), 'resource should finish', API_TIMEOUT);
      return runs(function() {
        expect(result).not.toBe(void 0);
        return expect(result.error.http_code).toEqual(404);
      });
    });
    xit("should allow deleting resources by prefix", function(done) {
      var resource, result;
      result = void 0;
      runs(function() {
        return cloudinary.uploader.upload("spec/logo.png", function(result_) {
          return result = result_;
        }, {
          timeout: UPLOAD_TIMEOUT,
          public_id: "api_test_by_prefix"
        });
      });
      waitsFor((function() {
        return result;
      }), 'upload should finish', UPLOAD_TIMEOUT);
      resource = void 0;
      runs(function() {
        expect(result.error).toBe(void 0);
        return cloudinary.api.resource("api_test_by_prefix", function(result_) {
          return resource = result_;
        });
      });
      waitsFor((function() {
        return resource;
      }), 'resource should finish', API_TIMEOUT);
      runs(function() {
        expect(resource).not.toBe(void 0);
        result = void 0;
        return cloudinary.api.delete_resources_by_prefix("api_test_by", function(result_) {
          return result = result_;
        });
      });
      waitsFor((function() {
        return result;
      }), 'delete_resources_by_prefix should finish', API_TIMEOUT);
      runs(function() {
        expect(result.error).toBe(void 0);
        return cloudinary.api.resource("api_test_by_prefix", function(result_) {
          return result = result_;
        });
      });
      waitsFor((function() {
        return result;
      }), 'resource should finish', API_TIMEOUT);
      return runs(function() {
        expect(result.error).toBe(void 0);
        return expect(result.error.http_code).toEqual(404);
      });
    });
    return;
    it("should allow deleting resources by tags", function(done) {
      this.timeout(10000);
      return cloudinary.uploader.upload("spec/logo.png", function(r) {
        if (r.error != null) {
          return done(new Error(r.error.message));
        }
        return cloudinary.api.resource("api_test4", function(resource) {
          expect(resource).not.toEqual(void 0);
          return cloudinary.api.delete_resources_by_tag("api_test_tag_for_delete", function(rr) {
            if (rr.error != null) {
              return done(new Error(rr.error.message));
            }
            return cloudinary.api.resource("api_test4", function(result) {
              expect(result.error).not.to.be(void 0);
              expect(result.error.http_code).toEqual(404);
              return done();
            });
          });
        });
      }, {
        public_id: "api_test4",
        tags: ["api_test_tag_for_delete"]
      });
    });
    it("should allow listing tags", function(done) {
      this.timeout(10000);
      return cloudinary.api.tags(function(result) {
        if (result.error != null) {
          return done(new Error(result.error.message));
        }
        expect(result.tags).toContain("api_test_tag");
        return done();
      });
    });
    it("should allow listing tag by prefix ", function(done) {
      this.timeout(10000);
      return cloudinary.api.tags(function(result) {
        if (result.error != null) {
          return done(new Error(result.error.message));
        }
        expect(result.tags).toContain("api_test_tag");
        return done();
      }, {
        prefix: "api_test"
      });
    });
    it("should allow listing tag by prefix if not found", function(done) {
      this.timeout(10000);
      return cloudinary.api.tags(function(result) {
        if (result.error != null) {
          return done(new Error(result.error.message));
        }
        expect(result.tags).to.have.length(0);
        return done();
      }, {
        prefix: "api_test_no_such_tag"
      });
    });
    it("should allow listing transformations", function(done) {
      this.timeout(10000);
      return cloudinary.api.transformations(function(result) {
        var transformation;
        if (result.error != null) {
          return done(new Error(result.error.message));
        }
        transformation = find_by_attr(result.transformations, "name", "c_scale,w_100");
        expect(transformation).not.toEqual(void 0);
        expect(transformation.used).to.be.ok;
        return done();
      });
    });
    it("should allow getting transformation metadata", function(done) {
      this.timeout(10000);
      return cloudinary.api.transformation("c_scale,w_100", function(transformation) {
        expect(transformation).not.toEqual(void 0);
        expect(transformation.info).toEqual([
          {
            crop: "scale",
            width: 100
          }
        ]);
        return done();
      });
    });
    it("should allow getting transformation metadata by info", function(done) {
      this.timeout(10000);
      return cloudinary.api.transformation({
        crop: "scale",
        width: 100
      }, function(transformation) {
        expect(transformation).not.toEqual(void 0);
        expect(transformation.info).toEqual([
          {
            crop: "scale",
            width: 100
          }
        ]);
        return done();
      });
    });
    it("should allow updating transformation allowed_for_strict", function(done) {
      this.timeout(10000);
      return cloudinary.api.update_transformation("c_scale,w_100", {
        allowed_for_strict: true
      }, function() {
        return cloudinary.api.transformation("c_scale,w_100", function(transformation) {
          expect(transformation).not.toEqual(void 0);
          expect(transformation.allowed_for_strict).to.be.ok;
          return cloudinary.api.update_transformation("c_scale,w_100", {
            allowed_for_strict: false
          }, function() {
            return cloudinary.api.transformation("c_scale,w_100", function(transformation) {
              expect(transformation).not.toEqual(void 0);
              expect(transformation.allowed_for_strict).not.to.be.ok;
              return done();
            });
          });
        });
      });
    });
    it("should allow creating named transformation", function(done) {
      this.timeout(10000);
      return cloudinary.api.create_transformation("api_test_transformation", {
        crop: "scale",
        width: 102
      }, function() {
        return cloudinary.api.transformation("api_test_transformation", function(transformation) {
          expect(transformation).not.toEqual(void 0);
          expect(transformation.allowed_for_strict).to.be.ok;
          expect(transformation.info).toEqual([
            {
              crop: "scale",
              width: 102
            }
          ]);
          expect(transformation.used).not.to.be.ok;
          return done();
        });
      });
    });
    it("should allow unsafe update of named transformation", function(done) {
      this.timeout(10000);
      return cloudinary.api.create_transformation("api_test_transformatio3", {
        crop: "scale",
        width: 102
      }, function() {
        return cloudinary.api.update_transformation("api_test_transformation3", {
          unsafe_update: {
            crop: "scale",
            width: 103
          }
        }, function() {
          return cloudinary.api.transformation("api_test_transformation3", function(transformation) {
            expect(transformation).not.toEqual(void 0);
            expect(transformation.info).toEqual([
              {
                crop: "scale",
                width: 103
              }
            ]);
            expect(transformation.used).not.to.be.ok;
            return done();
          });
        });
      });
    });
    it("should allow deleting named transformation", function(done) {
      this.timeout(10000);
      return cloudinary.api.delete_transformation("api_test_transformation", function() {
        return cloudinary.api.transformation("api_test_transformation", function(transformation) {
          expect(transformation.error.http_code).toEqual(404);
          return done();
        });
      });
    });
    it("should allow deleting implicit transformation", function(done) {
      this.timeout(10000);
      return cloudinary.api.transformation("c_scale,w_100", function(transformation) {
        expect(transformation).not.toEqual(void 0);
        return cloudinary.api.delete_transformation("c_scale,w_100", function() {
          return cloudinary.api.transformation("c_scale,w_100", function(transformation) {
            expect(transformation.error.http_code).toEqual(404);
            return done();
          });
        });
      });
    });
    return it("should support the usage API call", function(done) {
      this.timeout(10000);
      return cloudinary.api.usage(function(usage) {
        expect(usage.last_update).not.toEqual(null);
        return done();
      });
    });
  });

}).call(this);
