var app = angular.module('app', ['ngResource']),
    rankingLength = 10,
    Share;

app.controller('PersonCtrl', function($scope, $resource) {


    var Person = $resource('persons/:id', {
        id: '@id'
    });
    var Votes = $resource('persons/:id/votes', {
        id: '@id'
    });

    $scope.persons = Person.query();

    $scope.vote = function(share) {

        var votes,
            conf = '支持讲师 ' +
                share.speaker + ' ？';

        if (confirm(conf)) {
            Votes.save({
                id: share.id
            }, function(data) {
                switch (data.votes) {
                    case -1:
                        alert('您今天已经投过票了，谢谢参与！');
                        break;
                    case -2:
                        alert('投票已经结束，谢谢参与！');
                        break;
                    default:
                        share.votes = data.votes;
                        rank();
                        break;
                }
            });
        };

    };

    $scope.person = {};
    $scope.add = function() {
        Person.save($scope.person, function(person) {
            $scope.persons.push(person);
            $scope.person = {};
        })
    };
    $scope.del = function() {
        var oldShare = $scope.share;
        $scope.share = [];
        angular.forEach(oldShare, function(s) {
            if (!s.del) $scope.share.push(s);
            else Share.remove({
                id: s.id
            });
        });
    };


});