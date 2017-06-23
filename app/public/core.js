var lyrics = angular.module('lyrics', []);

function mainController($scope, $http) {
    $scope.formData = {};

    $scope.initialize = function() {
        $scope.lyrics = {};
        $scope.waiting = "";
    };

    $scope.getArtistLyrics = function() {
        $scope.waiting = "Gathering results please wait.";
        $http.post('/api/count', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.lyrics = data;
                $scope.waiting = ""
            })
            .error(function(data) {
                $scope.waiting = ""
                console.log('Error: ' + data);
            });
    };

}

