var lyrics = angular.module('lyrics', []);

function mainController($scope, $http) {
    $scope.formData = {};

    $scope.initialize = function() {
        $scope.lyrics = {};
    };

    $scope.getArtistLyrics = function() {
        $http.post('/api/count', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                $scope.lyrics = data;
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

}

