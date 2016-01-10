var listApp = angular.module('listApp', []);
listApp.controller('listCtrl', function ($scope, $http, $location){
  	$scope.showTaskInfo = true;
	var hideLists = false;
	var currentListId;
	$scope.createList = true;
	$scope.finishedTasks = [];
	$http({
		method:'GET',
		url:'/getUser'
	}).then(function successCallback(response){
		$scope.userEmail = response['data'][0]['email'];
	}, function errorCallback(response){
		throw new Error('Error!');
	});
	$scope.loadTask = function(task, index){
		for(var i in $scope.lists){
			$scope.lists[i]['style'] = '';
		}
		$scope.lists[index]['style'] = 'active';
		$scope.currentList = $scope.lists[index].title;
		currentListId = task;
		hideLists = false;
		$location.path('lists/' + task);
		$http({
			method: 'GET',
			url: $location.path()
		}).then(function successCallback(response){
			$scope.tasks = [];
			if(response.data[0]){
				for (var task in response.data){
					var newTask = response.data[task];
					newTask['style'] = '';
					if (newTask.status){
						newTask['state'] = true;
						newTask.status = true;
						$scope.finishedTasks.push(newTask);
					}
					else{
						$scope.tasks.push(newTask);	
					}
				}
			}
			$scope.currentTask = $scope.tasks[0] || $scope.finishedTasks[0];
		}, function errorCallback(response){
			throw new Error('Error!');
		});
	}
	var parseUrl = function(){
		var expr = /(?:\/lists)[\/]([\w]{5,})/;
		var find = $location.path().match(expr);
		currentListId = find;
		if(find !== null){
			for (var i = 0; i < $scope.lists.length; i++) {
				if($scope.lists[i]['_id'].toString() === find[1]){
					$scope.loadTask(find[1], i);
					$scope.lists[i]['style'] = 'active';
					$scope.currentList = $scope.lists[i].title;
				}
			};
		}
	}
	var loadAllLists = function(){
		$http({
			method:'GET',
			url: '/lists'
		}).then(function successCallback(response){
			if (response.data === "No login"){
				window.location.replace("/login");
			}
			$scope.lists = response.data[0].lists;
			parseUrl();
		}, function errorCallback(response){
			throw new Error('Error!');
		});
	}
	loadAllLists();
	
	$scope.addTask = function(task){
		if($location.path() === '/lists' || $location.path() === '/lists/'){
			alert('Choose the list before adding to-do');
			return false;
		}
		document.getElementsByClassName('addTaskButton')[0].value='';
		$http({
			method: 'POST',
			url: $location.path() + '/newTask',
			data: task
		}).then(function successCallback(response){	
			$scope.tasks.push(response.data[response.data.length-1]);
		}, function errorCallback(response){
			throw new Error('Error!');
		});
	}

  	$scope.addList = function(list){
		document.getElementsByClassName('addListField')[0].value='';
  		if(list){
  			$http({
		  		method: 'POST',
		  		url: '/newList',
		   		data: list
			}).then(function successCallback(response) {
				$location.path('lists/' + response.data);
				currentListId = response.data;
				$scope.finishedTasks = [];
				$scope.tasks = [];
				$scope.lists.push({
					'title':list.listName,
					'_id': response.data
				});
				$scope.createList = true;
				for(var i in $scope.lists){
					$scope.lists[i]['style'] = '';
				}
				$scope.lists[$scope.lists.length - 1]['style'] = 'active';
				$scope.currentList = $scope.lists[$scope.lists.length - 1].title;

  		})

  		}
  		else{
  			$scope.createList = false;
  		}
  	}

  	$scope.removeList = function(list){
  		$http({
  			method: 'GET',
  			url: '/deleteList/' + list,
  		}).then(function successCallback(response){
  			loadAllLists();
  			$scope.tasks = [];
  			$scope.finishedTasks = [];
  			$location.path('/lists');
  			$scope.currentList=''
  		}, function errorCallback(response){
  			throw new Error('Error!');
  		});
  	}

  	$scope.closeAddList = function(){
		document.getElementsByClassName('addListField')[0].value='';
  		$scope.createList = true;
  	}

  	$scope.changeTaskState = function(index){
  		var obj = $scope.tasks.splice(index,1)[0];
  		obj['state'] = !hideLists;
  		obj.status = true;
  		$http({
  			method: 'GET',
  			url:/lists/ + currentListId + '/changeTaskState/' + obj['_id']
  		}).then(function successCallback(response){
  			$scope.finishedTasks.push(obj);
  		}, function errorCallback(response){
  			throw new Error('Error!');
  		});
  	}

  	$scope.changeFinishedTaskState = function(index){
  		var obj = $scope.finishedTasks.splice(index,1)[0];
  		$http({
  			method: 'GET',
  			url:/lists/ + currentListId + '/revertTaskState/' + obj['_id']
  		}).then(function successCallback(response){
  			delete obj.state;
  			$scope.tasks.push(obj);
  		}, function errorCallback(response){
  			throw new Error('Error!');
  		});
  	}
  	$scope.showCompleted = function(){
  		hideLists = !hideLists;
  		for(var task in $scope.finishedTasks){
  			$scope.finishedTasks[task].state = !$scope.finishedTasks[task].state;
  		}
  	}
  	$scope.showInfo = function(task, index){
  		$scope.currentTaskId = index;
  		$scope.currentTask = task;
  		document.getElementsByClassName('dateButton')[0].value = task.date.slice(0,10);
  		for (var task in $scope.tasks){
  			$scope.tasks[task].style = '';
  		}
  		for (var task in $scope.finishedTasks){
  			$scope.finishedTasks[task].style = '';
  		}
  		if ($scope.currentTask.state === undefined){
  			$scope.tasks[index].style = ' active';
  		}
  		else{
  			$scope.finishedTasks[index].style = ' active';
  		}
  		$scope.showTaskInfo = false;
  		$location.path('/tasks/' + $scope.currentTask['_id']);
  	}

  	$scope.closeShowTaskInfo = function(){
  		$location.path('/lists/' + currentListId);
  		$scope.showTaskInfo = true;
  			for (var task in $scope.tasks){
  				$scope.tasks[task].style = '';
  			}
  			for (var task in $scope.finishedTasks){
  				$scope.finishedTasks[task].style = '';
  			}
  	}

  	$scope.setDate = function(task, date){
  		$http({
  			method: 'GET',
  			url: '/lists/' + currentListId + '/' + task['_id'] +'/updateDate/' + date
  		}).then(function successCallback(response){
  			$scope.showTaskInfo = true;
  			$scope.loadTask(currentListId, $scope.currentTaskId);
  			if ($scope.currentTask.state === undefined){
	  			$scope.tasks[$scope.currentTaskId].style = ' active';
	  		}
	  		else{
	  			$scope.finishedTasks[$scope.currentTaskId].style = ' active';
	  		}
	  		
  		}), function errorCallback(response){
  			throw new Error('Error!');
  		};
	}
});