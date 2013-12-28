var app = angular.module('app', ['ngResource']);

app.controller('AwardCtrl', function($scope, $resource) {


    var Awards = $resource('awards/:type', {
        type: '@type'
    });
    var Votes = $resource('persons/:id/votes', {
        id: '@id'
    });

    function rank(data) {
        data.sort(function(a, b) {
            return b.votes - a.votes;
        });
    }

    var awardPersons = {
        1: Awards.query({
            type: 1
        }, rank),
        2: Awards.query({
            type: 2
        }, rank)
    }
    $scope.awards = [{
        type: 1,
        desc: '个人奖项',
        persons: awardPersons[1]
    }, {
        type: 2,
        desc: '团队奖项',
        persons: awardPersons[2]
    }];

    $scope.vote = function(person) {
        var votes,
            conf = '支持 ' + person.name + ' ？';
        if (confirm(conf)) {
            Votes.save({
                id: person.id
            }, function(data) {
                switch (data.votes) {
                    case -1:
                        alert('您今天已经投过票了，谢谢参与！');
                        break;
                    case -2:
                        alert('投票已经结束，谢谢参与！');
                        break;
                    default:
                        person.votes = data.votes;
                        rank(awardPersons[person.award]);
                        break;
                }
            });
        };
    };


});