var site = "Tritronik";
var haServices = angular.module('haServices', ['ngResource']);

function randomize(max) {
	return Math.floor(Math.random() * max);
}

function createResource($resource, url, method, isArray) {
	return $resource(wsurl + url, {}, {
		execute: {
			method: method,
			params: {},
			isArray: isArray
		}
	});
}

haServices.factory("Login", ["$resource", function ($resource) {
	return {
		login: function () {
			return createResource($resource, "/clients", "GET", true);
		}
	};
}]);

haServices
	.factory(
		"Test",
		[
			"$resource",
			function ($resource) {
				return {
					opticalpower: function (oltId) {
						return createResource($resource,
							`/onu/opticalpower/oltId/${oltId}`, "GET", false);
					},
					slotonu: function (oltId) {
						return createResource($resource,
							`/onu/slotonu/oltId/${oltId}`, "GET", false);
					},
					rebootonu: function (oltId) {
						return createResource($resource,
							`/onu/rebootonu/oltId/${oltId}`, "POST", false);
					},
					statusonu: function (oltId) {
						return createResource($resource,
							`/onu/statusonu/oltId/${oltId}`, "GET", false);
					},
					changestate: function (oltId) {
						return createResource($resource,
							`/onu/changestate/oltId/${oltId}`, "POST", false);
					},
					illegalonu: function (oltId) {
						return createResource($resource,
							`/onu/illegalonu/oltId/${oltId}`, "GET", false);
					},
					register: function (oltId) {
						return createResource($resource,
							`/onu/register/oltId/${oltId}`, "POST", false);
					},
					registeredOnu: function (oltId) {
						return createResource($resource,
							`/onu/registeredOnu/oltId/${oltId}`, "GET", false);
					},
					unregister: function (oltId) {
						return createResource($resource,
							`/onu/unregister/oltId/${oltId}`, "POST", false);
					},
					getPolicy: function (oltId) {
						return createResource($resource,
							`/onu/policy/oltId/${oltId}`, "GET", true);
					},
					savePolicy: function (oltId) {
						return createResource($resource,
							`/onu/policy/oltId/${oltId}`, "POST", false);
					},
					updatePolicy: function (oltId) {
						return createResource($resource,
							`/onu/policyUpdate/oltId/${oltId}`, "POST", false);
					},
					deletePolicy: function (oltId) {
						return createResource($resource,
							`/onu/deletePolicy/oltId/${oltId}`, "POST", false);
					},
					listAssignedPolicy: function (oltId) {
						return createResource($resource,
							`/onu/listAssignedPolicy/oltId/${oltId}`, "GET",
							true);
					},
					egressPolicy: function () {
						return createResource($resource,
							"/onu/egressPolicy", "POST", false);
					},
					ingressPolicy: function () {
						return createResource($resource,
							"/onu/ingressPolicy", "POST", false);
					},
					packageChanges: function () {
						return createResource($resource,
							"/packageChanges", "POST", false);
					},
					history: function () {
						return createResource($resource,
							"/packageChangesByCustomerId",
							"GET", true);
					},
					getDbaProfile: function () {
						return createResource($resource,
							"/onu/dbaProfile", "GET", true);
					},
					createDbaProfile: function () {
						return createResource($resource,
							"/onu/dbaProfile", "POST", false);
					},
					updateDbaProfile: function () {
						return createResource($resource,
							"/onu/updateDbaProfile", "POST",
							false);
					},
					deleteDbaProfile: function () {
						return createResource($resource,
							"/onu/deleteDbaProfile", "POST",
							false);
					},
					getLineProfiles: function (oltId) {
						return createResource($resource,
							`/onu/lineProfiles/olt/${oltId}`, "GET", true);
					},
					createLineProfiles: function () {
						return createResource($resource,
							"/onu/lineProfiles", "POST", false);
					},
					deleteLineProfiles: function () {
						return createResource($resource,
							"/onu/deleteLineProfile", "POST",
							false);
					},
					createGem: function () {
						return createResource($resource,
							"/onu/gem", "POST", false);
					},
					createTcont: function () {
						return createResource($resource,
							"/onu/tcont", "POST", false);
					},
					getServiceProfiles: function (oltId) {
						return createResource($resource,
							`/onu/serviceProfiles/olt/${oltId}`, "GET", true);
					},
					createServiceProfiles: function () {
						return createResource($resource,
							"/onu/serviceProfiles", "POST",
							false);
					},
					deleteServiceProfiles: function () {
						return createResource($resource,
							"/onu/deleteServiceProfile",
							"POST", false);
					},
					changePolicy: function () {
						return createResource($resource,
							"/onu/changePolicy", "POST", false);
					},
					updateClient: function () {
						return createResource($resource, "/client",
							"POST", false);
					},
					getClient: function () {
						return createResource($resource, "/clientById",
							"GET", false);
					},
					getClients: function () {
						return createResource($resource, "/clients", "GET", true);
					},
					getOnuByCustomerId: function () {
						return createResource($resource, "/onu/getOnuByCustomerId", "GET", true);
					},
					updateOnt: function () {
						return createResource($resource, "/onu/saveOnt", "POST", false);
					},
					getOlt: function () {
						return createResource($resource, "/olt", "GET", true);
					}
				};
			}]);
