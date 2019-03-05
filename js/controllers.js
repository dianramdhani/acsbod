var haControllers = angular.module('haControllers', []);

/* Menu */

var timeoutid;

function checkLogin(onLogin, protect) {
	if (localStorage.remtoken == null && !onLogin) {
		window.location = "#!/login";
	}

	if (localStorage.remtoken != null && onLogin) {
		if (localStorage.remrole == 'admin') {
			window.location = "#!/clients";
		} else {
			window.location = "#!/dashboard";
		}
	}

	if (!onLogin && protect && localStorage.remtoken != null) {
		window.location = "#!/dashboard";
	} else if (!onLogin && protect && localStorage.remtoken == null) {
		window.location = "#!/login";
	}

	if (localStorage.remtoken) {
		if (!timeout || timeout == 0) {
			timeout = 1800000;
		}

		var d = new Date();
		if (localStorage.remexpire && localStorage.remexpire < d.getTime()) {
			logout();
		} else {
			if (timeoutid) {
				clearTimeout(timeoutid);
			}

			timeoutid = setTimeout(function () {
				logout();
			}, timeout);

			localStorage.remexpire = d.getTime() + timeout;
		}

	}
}

function logout() {
	localStorage.removeItem("remtoken");
	localStorage.removeItem("remid");
	localStorage.removeItem("remrole");
	localStorage.removeItem("remexpire");
	checkLogin(false);
}

function hideMenu($scope) {
	if (localStorage.remtoken == null) {
		$scope.hideMenu = true;
	} else {
		$scope.hideMenu = false;
	}
}

/* Controllers */

haControllers.controller('MainCtrl', [
	'$scope',
	'$mdDialog',
	'$mdSidenav',
	function ($scope, $mdDialog, $mdSidenav) {
		$scope.loggedin = localStorage.remusername;

		$scope.toggleLeft = buildToggler('left');
		function buildToggler(navID) {
			return function () {
				$mdSidenav(navID).toggle().then(function () {
				});
			};
		}

		$scope.logout = function (ev) {
			var confirm = $mdDialog.confirm().title("").textContent(
				"Logout from this application?").ariaLabel('Logout')
				.targetEvent(ev).ok('Logout').cancel('Cancel');

			$mdDialog.show(confirm).then(function () {
				logout();
			});
		};

		$scope.account = function () {
			window.location = "#!/account";
		}

		$scope.hide = function () {
			if (localStorage.remtoken == null) {
				$scope.hideMenu = true;
				$scope.hideAccount = true;
				$scope.mainlink = "#!/login";
			} else if (localStorage.remrole == "admin") {
				$scope.hideMenu = false;
				$scope.hideAccount = false;
				$scope.mainlink = "#!/clients";
			} else {
				$scope.hideMenu = true;
				$scope.hideAccount = false;
				$scope.mainlink = "#!/dashboard";
			}

			$scope.loggedin = localStorage.remusername;
		};

		$scope.$on("load", function (event, page) {
			$scope.hide();
		});

		$scope.$on("alert", function (event, message) {
			showAlert($scope, message.title, message.message);
		});

		$scope.$on("error", function (event, error) {
			handleError($scope, error);
		});

		$scope.hide();
	}]);

haControllers.controller('BlankCtrl', ['$scope', '$mdDialog',
	function ($scope, $mdDialog) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");
	}]);

haControllers
	.controller(
		'LoginCtrl',
		[
			'$scope',
			'$mdDialog',
			'Login',
			function ($scope, $mdDialog, service) {
				$scope.login = function () {
					if ($scope.username == null
						|| $scope.password == null) {
						showErrors();
					} else {
						if ($scope.username == 'admin') {
							if ($scope.password == 'admin123') {
								localStorage.remid = "admin";
								localStorage.remtoken = "admin";
								localStorage.remusername = "admin";
								localStorage.remrole = "admin";
								localStorage
									.removeItem("remexpire");

								checkLogin(true);
							} else {
								showAlert($mdDialog,
									"Login Failed",
									"Invalid credentials");
							}
						} else {

							execute(
								$scope,
								$mdDialog,
								true,
								service.login(),
								{},
								function (result) {
									var found = false;
									for (i = 0; i < result.length; i++) {
										var data = result[i];
										if (data.email == $scope.username) {
											found = true;
											localStorage.remid = data.id;
											localStorage.remtoken = data.snOnu;
											localStorage.remusername = data.name;
											localStorage.remrole = $scope.username;
											localStorage
												.removeItem("remexpire");
											localStorage.encriptedSn = data.encriptedSn;
											localStorage.lineProfileId = data.lineProfileId;
											localStorage.client = JSON
												.stringify(data);
											checkLogin(true);
										}
									}

									if (!found) {
										showAlert($mdDialog,
											"Login Failed",
											"Invalid credentials");
									}
								});
						}
					}
				};

				checkLogin(true);
				$scope.$emit("load", "login");
			}]);

haControllers
	.controller(
		'DashboardCtrl',
		[
			'$scope',
			'$mdDialog',
			'$mdToast',
			'$filter',
			'Test',
			function ($scope, $mdDialog, $mdToast, $filter, service) {
				checkLogin(false);
				$scope.$emit("load", "dashboard");

				$scope.assignednow = "1MB";
				$scope.packnew = "1MB";
				$scope.packs = ["1MB", "10MB", "100MB", "1GB"];
				$scope.sn = localStorage.remtoken;
				$scope.period = 'temporary';

				$scope.startdate = {};
				$scope.enddate = {};
				generateDatePicker($scope.startdate, null);
				generateDatePicker($scope.enddate, null);

				$scope.end = moment().endOf('month');
				$scope.today = moment();
				$scope.selected = [];

				var packmap = {};

				// $scope.selecttab = function (index) {
				// $scope.devicenow = $scope.devices[index];
				// }

				refresh = function () {
					sn = localStorage.remtoken;
					$scope.selected = [];

					execute(
						$scope,
						$mdDialog,
						true,
						service.getClient(),
						{
							id: localStorage.remid
						},
						function (result) {
							$scope.assignednow = result;

							execute(
								$scope,
								$mdDialog,
								true,
								service
									.getOnuByCustomerId(),
								{
									customerId: localStorage.remid
								},
								function (result) {
									$scope.devices = result;
									$scope.devicenow = result[0];

									$scope.devicemap = {};
									for (i = 0; i < result.length; i++) {
										var device = result[i];
										$scope.devicemap[device.id] = device;
									}
								});

							execute(
								$scope,
								$mdDialog,
								true,
								service.getPolicy(),
								{},
								function (result) {
									$scope.packs = result;
									packmap = {};
									for (i = 0; i < result.length; i++) {
										var policy = result[i];
										packmap[policy.id] = policy;
									}

									$scope.packmap = packmap;
									$scope.history();
								});
						});

				}

				$scope.update = function (event) {
					var update = function (devices) {

						if (!devices) {
							devices = this.selected;
						}

						var id = JSON.parse(this.packnew).id;
						var start = moment(this.start);
						var end = moment(this.end);

						var devicex = {};
						var devicey = {};

						for (i = 0; i < devices.length; i++) {
							var device = devices[i];
							devicex[device.lineProfileId + "a"] = device;
							devicey[device.id + "b"] = device;

							if (start.isBefore(moment())) {
								execute(
									$scope,
									$mdDialog,
									true,
									service.changePolicy(),
									{
										encriptedSn: device.encriptedSn,
										lineProfileId: device.lineProfileId,
										policyId: id
									},
									function (result) {
										var device = devicex[result.getServiceProfileIds
											+ "a"];
										execute(
											$scope,
											$mdDialog,
											true,
											service
												.packageChanges(),
											{
												customerId: localStorage.remid,
												startDate: moment()
													.valueOf(),
												endDate: end
													.valueOf(),
												originalPolicyId: device.subscribedPolicyId,
												changedPolicyId: id,
												ontId: device.id,
												reverted: false,
												active: true
											},
											function (result) {
												var device = devicey[result.ontId
													+ "b"];
												device.packageChangesId = result.id;
												device.ingressPolicyId = id;
												device.egressPolicyId = id;

												execute(
													$scope,
													$mdDialog,
													true,
													service
														.updateOnt(),
													device,
													function (
														result) {
														showToast(
															$mdToast,
															'Successfully Add New BOD Schedule');
														refresh();
													});
											});
									});
							} else {
								execute(
									$scope,
									$mdDialog,
									true,
									service.packageChanges(),
									{
										customerId: localStorage.remid,
										startDate: start
											.valueOf(),
										endDate: end.valueOf(),
										originalPolicyId: device.subscribedPolicyId,
										changedPolicyId: id,
										ontId: device.id,
										reverted: false,
										active: false
									},
									function (result) {

										showToast($mdToast,
											'Successfully Add New BOD Schedule');
										refresh();
									});
							}
						}

					}

					var selectDevices = function () {
						showPopup($mdDialog,
							'partials/selectdevices.html',
							event, true, {
								selected: [],
								devices: $scope.devices,
								packnew: this.packnew,
								start: this.start,
								end: this.end,
								save: function () {
									this.update(this.selected);
								},
								update: update
							}

						);
					}

					showPopup(
						$mdDialog,
						'partials/changepackage.html',
						event,
						true,
						{
							packnew: JSON
								.stringify($scope.packs[0]),
							packs: $scope.packs,
							asssignednow: $scope.assignednow,
							start: moment(),
							end: $scope.end,
							update: update,
							selectDevices: selectDevices,
							selected: $scope.selected
						}

					);
				}

				$scope.download = function () {
					var output = [];
					for (i = 0; i < $scope.model.data.length; i++) {
						var d = $scope.model.data[i];
						var o = {};
						o.customerId = d.customerId;
						o.originalPolicy = packmap[d.originalPolicyId].name;
						o.changedPolicy = packmap[d.changedPolicyId].name;
						o.startDate = $filter('date')(d.startDate,
							"dd MMMM yyyy HH:mm");
						o.endDate = $filter('date')(d.endDate,
							"dd MMMM yyyy HH:mm");
						o.reverted = d.reverted;
						output.push(o);
					}

					exportCSVFile({
						customerId: "Customer ID",
						originalPolicy: "Original Package",
						changedPolicy: "BOD Package",
						startDate: "Start Date",
						endDate: "Expired Date",
						reverted: "Expired"
					}, output, "history.csv");
				}

				$scope.history = function (event) {
					execute($scope, $mdDialog, true, service
						.history(), {
							id: localStorage.remid
						}, function (result) {
							data = result;
							$scope.model = {
								data: data,
								packmap: packmap
							}

							$scope.historyMap = {};
							for (i = 0; i < data.length; i++) {
								var hist = data[i];
								// if(hist.id ==
								// $scope.devicenow.packageChangesId) {
								// $scope.historynow = hist;
								// if ($scope.historynow) {
								// var expire =
								// $scope.historynow.endDate
								// expire = expire - new
								// Date().getTime();
								// expire = Math.floor(expire / 1000);
								// // sec
								// expire = Math.floor(expire / 60); //
								// min
								// expire = Math.floor(expire / 60); //
								// hour
								//
								// $scope.expireday = Math.floor(expire
								// / 24);
								// $scope.expirehour = expire % 24;
								// }
								// break;
								// }
								$scope.historyMap[hist.id] = hist;
							}

							filterHistory();
						});
				}

				filterHistory = function () {
					$scope.filtered.data = [];
					if ($scope.model) {
						for (i = 0; i < $scope.model.data.length; i++) {
							var data = $scope.model.data[i];

							if ($scope.enddate.date
								.isAfter(moment(data.startDate))
								&& $scope.startdate.date
									.isBefore(moment(data.endDate))) {
								$scope.filtered.data.push(data);
							}
						}
					}
				}

				$scope.filtered = generateDataTable(5);
				addPickerFunctions($scope, filterHistory);
				$scope.pickWeek(true);
				refresh();

				$scope.openMenu = function ($mdMenu, ev) {
					$mdMenu.open(ev);
				};
			}]);

haControllers.controller('TestCtrl', ['$scope', '$mdDialog',
	function ($scope, $mdDialog) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");
	}]);

haControllers.controller('MonitorCtrl', [
	'$scope',
	'$mdDialog',
	'Test',
	function ($scope, $mdDialog, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");

		execute($scope, $mdDialog, true, service.getOlt(), {},
			function (result) {
				result = JSON.parse(JSON.stringify(result));
				$scope.olt = result;
			});

		$scope.oltSelectedEvent = function (oltId) {
			execute($scope, $mdDialog, true, service.opticalpower(oltId), {},
				function (result) {
					result = JSON.parse(JSON.stringify(result));
					var powers = [];
					for (r in result) {
						powers.push({
							serial: r,
							power: result[r] / 10
						});
					}
					$scope.powers = powers;
				});
		};
	}]);

haControllers.controller('RebootCtrl', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'Test',
	function ($scope, $mdDialog, $mdToast, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");
		var oltId;

		$scope.reboot = function (power) {
			execute($scope, $mdDialog, true, service.rebootonu(oltId), {
				slot: power.slot
			}, function (result) {
				showToast($mdToast, 'ONU Rebooted');
			});
		}

		execute($scope, $mdDialog, true, service.getOlt(), {},
			function (result) {
				result = JSON.parse(JSON.stringify(result));
				$scope.olt = result;
			});

		$scope.oltSelectedEvent = function (_oltId) {
			oltId = _oltId;

			execute($scope, $mdDialog, true, service.slotonu(oltId), {},
				function (result) {
					result = JSON.parse(JSON.stringify(result));
					var powers = [];
					for (r in result) {
						powers.push({
							slot: r.substring(r.lastIndexOf('.') + 1),
							serial: result[r]
						});
					}
					$scope.powers = powers;
				});
		};
	}]);

haControllers.controller('SuspendCtrl', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'Test',
	function ($scope, $mdDialog, $mdToast, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");
		var oltId;

		refresh = function () {
			execute($scope, $mdDialog, true, service.statusonu(oltId), {},
				function (result) {
					result = JSON.parse(JSON.stringify(result));
					var powers = [];
					for (r in result) {
						powers.push({
							slot: r.substring(r.lastIndexOf('.') + 1),
							state: result[r] == "1"
						});
					}
					$scope.powers = powers;
				});
		}

		$scope.suspend = function (power) {
			var state = "1";
			if (!power.state) {
				state = "2";
			}

			execute($scope, $mdDialog, true, service.changestate(oltId), {
				slot: power.slot,
				state: state
			}, function (result) {
				if (!power.state) {
					showToast($mdToast, 'ONU Suspended');
				} else {
					showToast($mdToast, 'ONU Enabled');
				}
				refresh();
			});
		}

		execute($scope, $mdDialog, true, service.getOlt(), {},
			function (result) {
				result = JSON.parse(JSON.stringify(result));
				$scope.olt = result;
			});

		$scope.oltSelectedEvent = function (_oltId) {
			oltId = _oltId;
			refresh();
		};
	}]);

haControllers.controller('RegisterCtrl', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'Test',
	function ($scope, $mdDialog, $mdToast, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");
		var oltId;

		function hex_to_ascii(str1) {
			var hex = str1.split(":");
			var str = '';
			for (var i = 0; i < hex.length; i++) {
				if (hex[i] != "00") {
					str += String.fromCharCode(parseInt(hex[i], 16));
				}
			}
			return str;
		}

		var serviceProfiles = [];
		var lineProfiles = [];
		refresh = function () {
			execute($scope, $mdDialog, true, service.illegalonu(oltId), {},
				function (result) {
					result = JSON.parse(JSON.stringify(result));
					var powers = [];
					for (r in result) {
						powers.push({
							serial: hex_to_ascii(result[r])
						});
					}
					$scope.powers = powers;
				});

			execute($scope, $mdDialog, true, service.getServiceProfiles(oltId),
				{}, function (result) {
					serviceProfiles = result;
				});

			execute($scope, $mdDialog, true, service.getLineProfiles(oltId), {},
				function (result) {
					lineProfiles = result;
				});
		}

		$scope.reboot = function (power, event) {
			newmodel = {
				sn: power.serial,
				lineProfiles: lineProfiles,
				serviceProfiles: serviceProfiles
			};
			newmodel.save = function () {
				execute($scope, $mdDialog, true, service.register(oltId), {
					sn: this.sn,
					serviceProfileId: this.serviceProfileId,
					lineProfileId: this.lineProfileId
				}, function (result) {
					showToast($mdToast, 'ONU Registered');
					refresh();
				});
			}

			showPopup($mdDialog, 'partials/addonu.html', event, true,
				newmodel);
		}

		execute($scope, $mdDialog, true, service.getOlt(), {},
			function (result) {
				result = JSON.parse(JSON.stringify(result));
				$scope.olt = result;
			});

		$scope.oltSelectedEvent = function (_oltId) {
			oltId = _oltId;
			refresh();
		};
	}]);

haControllers.controller('UnregisterCtrl', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'Test',
	function ($scope, $mdDialog, $mdToast, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");
		var oltId;

		refresh = function () {
			execute($scope, $mdDialog, true, service.registeredOnu(oltId), {},
				function (result) {
					result = JSON.parse(JSON.stringify(result));
					var powers = [];
					for (r in result) {
						powers.push({
							serial: result[r]
						});
					}
					$scope.powers = powers;
				});
		}

		$scope.reboot = function (power) {
			execute($scope, $mdDialog, true, service.unregister(oltId), {
				sn: power.serial
			}, function (result) {
				showToast($mdToast, 'ONU Unregistered');
				refresh();
			});
		}

		execute($scope, $mdDialog, true, service.getOlt(), {},
			function (result) {
				result = JSON.parse(JSON.stringify(result));
				$scope.olt = result;
			});

		$scope.oltSelectedEvent = function (_oltId) {
			oltId = _oltId;
			refresh();
		};
	}]);

haControllers.controller('PolicyCtrl', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'Test',
	function ($scope, $mdDialog, $mdToast, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");
		var oltId;

		var maxid = 0;
		refresh = function () {
			execute($scope, $mdDialog, true, service.getPolicy(oltId), {},
				function (result) {
					$scope.powers = result;

					maxid = 0;
					for (i = 0; i < result.length; i++) {
						var id = parseInt(result[i].id);
						if (id > maxid) {
							maxid = id;
						}
					}
				});
		}

		save = function (model, isNew) {
			var serv = service.updatePolicy(oltId);
			if (isNew) {
				serv = service.savePolicy(oltId);
			}

			execute($scope, $mdDialog, false, serv, model,
				function (result) {
					if (!result.pbs || result.id == 'noSuchInstance') {
						showToast($mdToast, 'Add Policy Failed');
					} else {
						showToast($mdToast, 'Policy Saved');
						refresh();
					}
				});
		}

		$scope.add = function (event) {
			newmodel = {};
			newmodel.save = function () {
				save({
					id: maxid + 1,
					name: this.name,
					cir: this.cir,
					pir: this.pir,
					pbs: this.pbs,
					cbs: this.cbs
				}, true);
			}

			showPopup($mdDialog, 'partials/addpolicy.html', event, true,
				newmodel);
		}

		$scope.edit = function (model, event) {
			newmodel = JSON.parse(JSON.stringify(model));
			newmodel.save = function () {
				save({
					id: this.id,
					name: this.name,
					cir: this.cir,
					pir: this.pir,
					pbs: this.pbs,
					cbs: this.cbs
				}, false);
			}

			showPopup($mdDialog, 'partials/addpolicy.html', event, true,
				newmodel);
		}

		$scope.remove = function (model, event) {
			var confirm = $mdDialog.confirm().title('Confirmation')
				.textContent("Delete this profile?").ariaLabel(
					'Confirmation').targetEvent(event).ok("Delete")
				.cancel('cancel');

			$mdDialog.show(confirm).then(
				function () {
					execute($scope, $mdDialog, true, service.deletePolicy(oltId), model, function (result) {
						showToast($mdToast, 'Policy Deleted');
						refresh();
					});
				});
		}

		execute($scope, $mdDialog, true, service.getOlt(), {},
			function (result) {
				result = JSON.parse(JSON.stringify(result));
				$scope.olt = result;
			});

		$scope.oltSelectedEvent = function (_oltId) {
			oltId = _oltId;
			refresh();
		};
	}]);

haControllers.controller('BandwidthCtrl', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'Test',
	function ($scope, $mdDialog, $mdToast, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");
		var oltId;

		refresh = function () {
			execute($scope, $mdDialog, true, service.listAssignedPolicy(oltId),
				{}, function (result) {
					$scope.powers = result;
				});

			execute($scope, $mdDialog, true, service.getPolicy(oltId), {},
				function (result) {
					$scope.policy = result;
				});
		}

		$scope.update = function (power) {
			execute($scope, $mdDialog, true, service.egressPolicy(oltId), {
				slotOnu: power.slotOltOnuUni,
				idPolicy: power.idEgressPolicy
			}, function (result) {
				execute($scope, $mdDialog, true, service.ingressPolicy(oltId), {
					slotOnu: power.slotOltOnuUni,
					idPolicy: power.idIngressPolicy
				}, function (result) {
					showToast($mdToast, 'Bandwidth Updated');
					refresh();
				});
			});
		}

		execute($scope, $mdDialog, true, service.getOlt(), {},
			function (result) {
				result = JSON.parse(JSON.stringify(result));
				$scope.olt = result;
			});

		$scope.oltSelectedEvent = function (_oltId) {
			oltId = _oltId;
			refresh();
		};
	}]);

haControllers.controller('ClientsCtrl', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'Test',
	function ($scope, $mdDialog, $mdToast, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");

		refresh = function () {
			execute($scope, $mdDialog, true, service.getClients(), {},
				function (result) {
					$scope.powers = result;
				});
		}

		refresh();
	}]);

haControllers
	.controller(
		'DBACtrl',
		[
			'$scope',
			'$mdDialog',
			'$mdToast',
			'Test',
			function ($scope, $mdDialog, $mdToast, service) {
				checkLogin(false);
				$scope.$emit("load", "dashboard");

				var maxid = 0;
				refresh = function () {
					execute($scope, $mdDialog, true, service
						.getDbaProfile(), {}, function (result) {
							$scope.powers = result;

							maxid = 0;
							for (i = 0; i < result.length; i++) {
								var id = parseInt(result[i].id);
								if (id > maxid) {
									maxid = id;
								}
							}
						});
				}

				save = function (model, isNew) {
					var serv = service.updateDbaProfile();
					if (isNew) {
						serv = service.createDbaProfile();
					}

					execute(
						$scope,
						$mdDialog,
						false,
						serv,
						model,
						function (result) {
							if (!result.setDbaProfileName
								|| result.setDbaProfileName == 'noSuchInstance') {
								showToast($mdToast,
									'Add DBA Failed');
							} else {
								showToast($mdToast, 'DBA Saved');
								refresh();
							}
						});
				}

				$scope.add = function (event) {
					newmodel = {};
					newmodel.save = function () {
						save({
							id: maxid + 1,
							name: this.name,
							bandwidthType: this.bandwidthType,
							bandwidth: this.bandwidth,
						}, true);
					}

					showPopup($mdDialog, 'partials/adddba.html',
						event, true, newmodel);
				}

				$scope.edit = function (model, event) {
					newmodel = JSON.parse(JSON.stringify(model));
					newmodel.save = function () {
						save({
							id: this.id,
							name: this.name,
							bandwidthType: this.bandwidthType,
							bandwidth: this.bandwidth,
						}, false);
					}

					showPopup($mdDialog, 'partials/adddba.html',
						event, true, newmodel);
				}

				$scope.remove = function (model, event) {
					var confirm = $mdDialog.confirm().title(
						'Confirmation').textContent(
							"Delete this profile?").ariaLabel(
								'Confirmation').targetEvent(event).ok(
									"Delete").cancel('cancel');

					$mdDialog.show(confirm).then(
						function () {
							execute($scope, $mdDialog, true,
								service.deleteDbaProfile(),
								model, function (result) {
									showToast($mdToast,
										'DBA Deleted');
									refresh();
								});
						});
				}
				refresh();
			}]);

haControllers
	.controller(
		'LineCtrl',
		[
			'$scope',
			'$mdDialog',
			'$mdToast',
			'Test',
			function ($scope, $mdDialog, $mdToast, service) {
				checkLogin(false);
				$scope.$emit("load", "dashboard");

				var maxid = 0;
				refresh = function () {
					execute(
						$scope,
						$mdDialog,
						true,
						service.getLineProfiles(),
						{},
						function (result) {
							$scope.data = result;

							var powers = [];
							for (i = 0; i < result.length; i++) {
								var power = result[i];
								var height = 0;

								if (power.tcont.length > power.gem.length) {
									height = power.tcont.length;
								} else {
									height = power.gem.length;
								}

								var tmp = {
									id: power.id,
									name: power.name,
									height: height,
									tcont: power.tcont[0],
									gem: power.gem[0],
									index: i
								}
								powers.push(tmp);

								for (j = 1; j < height; j++) {
									tmp = {
										tcont: power.tcont[j],
										gem: power.gem[j]
									}
									powers.push(tmp);
								}
							}
							$scope.powers = powers;

							maxid = 0;
							for (i = 0; i < result.length; i++) {
								var id = parseInt(result[i].id);
								if (id > maxid && id < 128) {
									maxid = id;
								}
							}
						});
				}

				save = function (model) {
					var serv = service.createLineProfiles();

					var line = {
						id: model.id,
						name: model.name
					};
					execute(
						$scope,
						$mdDialog,
						false,
						serv,
						line,
						function (result) {
							var total = model.tcont.length
								+ model.gem.length;

							for (i = 0; i < model.tcont.length; i++) {
								var tcont = {
									lineProfileId: model.id,
									idDbaProfile: model.tcont[i].dbaProfileId
								}
								execute($scope, $mdDialog,
									false, service
										.createTcont(),
									tcont,
									function (result) {
										total--;

										if (total == 0) {
											refresh();
										}
									});
							}

							for (i = 0; i < model.gem.length; i++) {
								var tcont = {
									lineProfileId: model.id,
									gemId: model.gem[i].id,
									tcontId: model.gem[i].tcontId,
									policyId: model.gem[i].downstreamPolicyProfileId,
									vlan: 'hex:'
										+ model.gem[i].vlan
								}
								execute($scope, $mdDialog,
									false, service
										.createGem(),
									tcont,
									function (result) {
										total--;

										if (total == 0) {
											refresh();
										}
									});
							}
						});
				}

				update = function (model) {
					execute($scope, $mdDialog, false, service
						.deleteLineProfiles(), {
							id: model.id
						}, function (result) {
							setTimeout(function () {
								save(model);
							}, 1000);
						});
				}

				$scope.add = function (event) {
					newmodel = {
						tcont: [{
							id: 2
						}],
						gem: [{
							id: 1,
							mapping: 1,
							tcontId: 2,
							vlan: "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00"
						}]
					};
					newmodel.save = function () {
						save({
							id: maxid + 1,
							name: this.name,
							tcont: this.tcont,
							gem: this.gem,
						});
					};
					newmodel.addTcont = function () {
						this.tcont.push({
							id: 2
						});
					};
					newmodel.removeTcont = function (x) {
						this.tcont.splice(x, 1);
					};
					newmodel.addGem = function () {
						this.gem
							.push({
								id: 1,
								mapping: 1,
								tcontId: 2,
								vlan: "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00"
							});
					};
					newmodel.removeGem = function (x) {
						this.gem.splice(x, 1);
					};

					showPopup($mdDialog, 'partials/addline.html',
						event, true, newmodel);
				}

				$scope.edit = function (index, event) {
					newmodel = JSON.parse(JSON
						.stringify($scope.data[index]));
					newmodel.save = function () {
						update({
							id: this.id,
							name: this.name,
							tcont: this.tcont,
							gem: this.gem,
						});
					};
					newmodel.addTcont = function () {
						this.tcont.push({
							id: 2
						});
					};
					newmodel.removeTcont = function (x) {
						this.tcont.splice(x, 1);
					};
					newmodel.addGem = function () {
						this.gem
							.push({
								id: 1,
								mapping: 1,
								tcontId: 2,
								vlan: "00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00"
							});
					};
					newmodel.removeGem = function (x) {
						this.gem.splice(x, 1);
					};

					showPopup($mdDialog, 'partials/addline.html',
						event, true, newmodel);
				}

				$scope.remove = function (model, event) {
					var confirm = $mdDialog.confirm().title(
						'Confirmation').textContent(
							"Delete this profile?").ariaLabel(
								'Confirmation').targetEvent(event).ok(
									"Delete").cancel('cancel');

					$mdDialog
						.show(confirm)
						.then(
							function () {
								execute(
									$scope,
									$mdDialog,
									true,
									service
										.deleteLineProfiles(),
									{
										id: model.id
									},
									function (result) {
										showToast(
											$mdToast,
											'Line Deleted');
										refresh();
									});
							});
				}
				refresh();
			}]);

haControllers.controller('ServiceCtrl', [
	'$scope',
	'$mdDialog',
	'$mdToast',
	'Test',
	function ($scope, $mdDialog, $mdToast, service) {
		checkLogin(false);
		$scope.$emit("load", "dashboard");

		function ascii_to_hexa(str) {
			var arr1 = [];
			for (var n = 0, l = str.length; n < l; n++) {
				var hex = Number(str.charCodeAt(n)).toString(16);
				arr1.push(hex);
			}
			return arr1.join(':');
		}

		var maxid = 0;
		refresh = function () {
			execute($scope, $mdDialog, true, service.getServiceProfiles(),
				{}, function (result) {
					$scope.data = result;

					var powers = [];
					for (i = 0; i < result.length; i++) {
						var power = result[i];
						var height = power.unis.length;
						if (height == 0) {
							height = 1;
						}

						var tmp = {
							id: power.id,
							name: power.name,
							numOfEthPort: power.numOfEthPort,
							height: height,
							index: i,
							unis: power.unis[0]
						}
						powers.push(tmp);

						for (j = 1; j < height; j++) {
							tmp = {
								unis: power.unis[j]
							}
							powers.push(tmp);
						}
					}
					$scope.powers = powers;

					maxid = 0;
					for (i = 0; i < result.length; i++) {
						var id = parseInt(result[i].id);
						if (id > maxid && id < 100) {
							maxid = id;
						}
					}

				});
		}

		save = function (model) {
			var serv = service.createServiceProfiles();

			model.name = "hex:" + ascii_to_hexa(model.name);
			console.log(model.name);

			execute($scope, $mdDialog, false, serv, model,
				function (result) {
					refresh();
				});
		}

		update = function (model) {
			execute($scope, $mdDialog, false, service
				.deleteServiceProfiles(), {
					id: model.id
				}, function (result) {
					setTimeout(function () {
						save(model);
					}, 1000);
				});
		}

		$scope.add = function (event) {
			newmodel = {
				unis: [{
					mode: 1
				}]
			};
			newmodel.save = function () {
				save({
					id: maxid + 1,
					name: this.name,
					numOfEthPort: this.unis.length,
					unis: this.unis,
				});
			};
			newmodel.addUni = function () {
				this.unis.push({
					mode: 1
				});
			};
			newmodel.removeUni = function (x) {
				this.unis.splice(x, 1);
			};

			showPopup($mdDialog, 'partials/addservice.html', event, true,
				newmodel);
		}

		$scope.edit = function (index, event) {
			newmodel = JSON.parse(JSON.stringify($scope.data[index]));
			newmodel.save = function () {
				update({
					id: this.id,
					name: this.name,
					numOfEthPort: this.unis.length,
					unis: this.unis,
				});
			};
			newmodel.addUni = function () {
				this.unis.push({
					mode: 1
				});
			};
			newmodel.removeUni = function (x) {
				this.unis.splice(x, 1);
			};

			showPopup($mdDialog, 'partials/addservice.html', event, true,
				newmodel);
		}

		$scope.remove = function (model, event) {
			var confirm = $mdDialog.confirm().title('Confirmation')
				.textContent("Delete this profile?").ariaLabel(
					'Confirmation').targetEvent(event).ok("Delete")
				.cancel('cancel');

			$mdDialog.show(confirm).then(
				function () {
					execute($scope, $mdDialog, true, service
						.deleteServiceProfiles(), {
							id: model.id
						}, function (result) {
							showToast($mdToast, 'Service Deleted');
							refresh();
						});
				});
		}
		refresh();
	}]);