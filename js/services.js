var site = "Tritronik";
var haServices = angular.module('haServices', [ 'ngResource' ]);

function randomize(max) {
	return Math.floor(Math.random() * max);
}

function createResource($resource, url, method, isArray) {
	return $resource(wsurl + url, {}, {
		execute : {
			method : method,
			params : {},
			isArray : isArray
		}
	});
}

haServices.factory("Login", [ "$resource", function($resource) {
	return {
		login : function() {
			return createResource($resource, "/clients", "GET", true);
		}
	};
} ]);

haServices
		.factory(
				"Test",
				[
						"$resource",
						function($resource) {
							return {
								opticalpower : function() {
									return createResource($resource,
											"/onu/opticalpower", "GET", false);
								},
								slotonu : function() {
									return createResource($resource,
											"/onu/slotonu", "GET", false);
								},
								rebootonu : function() {
									return createResource($resource,
											"/onu/rebootonu", "POST", false);
								},
								statusonu : function() {
									return createResource($resource,
											"/onu/statusonu", "GET", false);
								},
								changestate : function() {
									return createResource($resource,
											"/onu/changestate", "POST", false);
								},
								illegalonu : function() {
									return createResource($resource,
											"/onu/illegalonu", "GET", false);
								},
								register : function() {
									return createResource($resource,
											"/onu/register", "POST", false);
								},
								registeredOnu : function() {
									return createResource($resource,
											"/onu/registeredOnu", "GET", false);
								},
								unregister : function() {
									return createResource($resource,
											"/onu/unregister", "POST", false);
								},
								getPolicy : function() {
									return createResource($resource,
											"/onu/policy", "GET", true);
								},
								savePolicy : function() {
									return createResource($resource,
											"/onu/policy", "POST", false);
								},
								updatePolicy : function() {
									return createResource($resource,
											"/onu/policyUpdate", "POST", false);
								},
								deletePolicy : function() {
									return createResource($resource,
											"/onu/deletePolicy", "POST", false);
								},
								listAssignedPolicy : function() {
									return createResource($resource,
											"/onu/listAssignedPolicy", "GET",
											true);
								},
								egressPolicy : function() {
									return createResource($resource,
											"/onu/egressPolicy", "POST", false);
								},
								ingressPolicy : function() {
									return createResource($resource,
											"/onu/ingressPolicy", "POST", false);
								},
								packageChanges : function() {
									return createResource($resource,
											"/packageChanges", "POST", false);
								},
								history : function() {
									return createResource($resource,
											"/packageChangesByCustomerId",
											"GET", true);
								},
								getDbaProfile : function() {
									return createResource($resource,
											"/onu/dbaProfile", "GET", true);
								},
								createDbaProfile : function() {
									return createResource($resource,
											"/onu/dbaProfile", "POST", false);
								},
								updateDbaProfile : function() {
									return createResource($resource,
											"/onu/updateDbaProfile", "POST",
											false);
								},
								deleteDbaProfile : function() {
									return createResource($resource,
											"/onu/deleteDbaProfile", "POST",
											false);
								},
								getLineProfiles : function() {
									return createResource($resource,
											"/onu/lineProfiles", "GET", true);
								},
								createLineProfiles : function() {
									return createResource($resource,
											"/onu/lineProfiles", "POST", false);
								},
								deleteLineProfiles : function() {
									return createResource($resource,
											"/onu/deleteLineProfile", "POST",
											false);
								},
								createGem : function() {
									return createResource($resource,
											"/onu/gem", "POST", false);
								},
								createTcont : function() {
									return createResource($resource,
											"/onu/tcont", "POST", false);
								},
								getServiceProfiles : function() {
									return createResource($resource,
											"/onu/serviceProfiles", "GET", true);
								},
								createServiceProfiles : function() {
									return createResource($resource,
											"/onu/serviceProfiles", "POST",
											false);
								},
								deleteServiceProfiles : function() {
									return createResource($resource,
											"/onu/deleteServiceProfile",
											"POST", false);
								},
								changePolicy : function() {
									return createResource($resource,
											"/onu/changePolicy", "POST", false);
								},
								updateClient : function() {
									return createResource($resource, "/client",
											"POST", false);
								},
								getClient : function() {
									return createResource($resource, "/clientById",
											"GET", false);
								},
								getClients : function() {
									return createResource($resource, "/clients", "GET", true);
								},
								getOnuByCustomerId : function() {
									return createResource($resource, "/onu/getOnuByCustomerId", "GET", true);
								},
								updateOnt : function() {
									return createResource($resource, "/onu/saveOnt", "POST", false);
								}
							};
						} ]);
