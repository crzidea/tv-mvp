var app = angular.module('app', ['ngResource']);

app.controller('PersonCtrl', function($scope, $resource) {

    var Person = $resource('persons/:id', {
        id: '@id'
    });

    $scope.persons = Person.query();

    $scope.person = {};
    $scope.add = function() {
        var person = {};
        $scope.person.name = $scope.person.name || '这是某人的名字';
        $scope.person.award = $scope.person.award || 1;
        $scope.person.dep1 = $scope.person.dep1 || '某一级部门';
        $scope.person.dep2 = $scope.person.dep2 || '某二级部门';
        $scope.person.details = $scope.person.details || '阐述字数不要太多或太少';
        $scope.person.img = $scope.person.img || 'http://crzidea.u.qiniudn.com/head.jpg';

        Person.save($scope.person, function() {
            $scope.persons.push($scope.person);
            $scope.person = {};
        })
    };
    $scope.del = function() {
        var newList = [];
        $scope.persons.map(function(p) {
            if (p.del) p.$delete();
            else newList.push(p);
        });
        $scope.persons = newList;
    };


});