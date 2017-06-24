var lyrics = angular.module('lyrics', []);

function mainController($scope, $http) {
    $scope.formData = {};

    $scope.initialize = function() {
        $scope.lyrics = {};
        $scope.waiting = "";
    };

    $scope.getArtistLyrics = function() {
        $scope.waiting = "Gathering results please wait";
        $scope.period = "."
        $scope.lyrics = ""
        $http.post('/api/count', $scope.formData)
            .success(function(data) {
                $scope.formData = {};
                z = [];
                i = 1;
                for (var k in data) {
                    if (data.hasOwnProperty(k)) {
                        z.push(i.toString() + ". " + k + " -> " + data[k]);
                        i = i + 1;
                    }
                }
                $scope.lyrics = z;
                $scope.waiting = ""
                $scope.period = ""
            })
            .error(function(data) {
                $scope.waiting = ""
                console.log('Error: ' + data);
            });
    };

}

