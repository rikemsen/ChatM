var app = angular.module('chatApp', ['angular-gestures', 'ngRoute'], setPostHeader),
    firstConnexion = 0,
    proxyURI = 'http://chat.dvp.io/',
    anoSmileys = {
      'smile.gif': ':)',
      'sad.gif': ':(',
      'wink.gif': ';)',
      'bigsmile.gif': ':D',
      'lol.gif': ':lol:',
      'mouarf.gif': ':mouarf:',
      'haha.gif': ':haha:',
      'ptdr.gif': ':ptdr:',
      'mrgreen.gif': ':mrgreen:',
      'aie.gif': ':aie:',
      'weird.gif': ':weird:',
      'lun1.gif': '8-)',
      'lun2.gif': ':lun:',
      'red.gif': ':oops:',
      'roll.gif': ':roll:',
      'no.gif': ':no:',
      'tongue.gif': ':P',
      'langue.gif': ':langue:',
      'langue2.gif': ':langue2:',
      'confused.gif': ':?',
      'eek.gif': '8O',
      'calim2.gif': ':calim2:',
      'cry.gif': ':cry:',
      'salut.gif': ':salut:',
      'awe.gif': ':hola:',
      'zzz.gif': ':zzz:',
      'cfou.gif': ':cfou:',
      'mur.gif': ':mur:',
      'evil.gif': ':evil:',
      'twisted.gif': ':twisted:',
      'whistle.gif': ':whistle:',
      'whistle2.gif': ':whistle2:',
      'chin.gif': ':chin:',
      'ccool.gif': ':ccool:',
      'koi.gif': ':koi:',
      'zen.gif': ':zen:',
      'roi.gif': ':roi:',
      'nono.gif': ':nono:',
      'ange.gif': ':ange:',
      'calin.gif': ':calin:',
      'kiss.gif': ':kiss:',
      'kiss2.gif': ':kiss2:',
      'zoubi.gif': ':zoubi:',
      'rose.gif': ':rose:',
      'rose2.gif': ':rose2:',
      'fleur.gif': ':fleur:',
      'fleur2.gif': ':fleur2:',
      'heart.gif': ':heart:',
      'java.gif': ':java:',
      'br.gif': ':arrow:',
      'triste.gif': ':triste:',
      'vomi.gif': ':vomi:',
      'alerte.gif': ':alerte:',
      'yeah.gif': ':yeah:',
      'bravo.gif': ':bravo:',
      'fume.gif': ':fume:',
      'salive.gif': ':salive:',
      'toutcasse.gif': ':toutcasse:',
      'fessee.gif': ':fessee:',
      'sm.gif': ':sm:',
      'scarymovie.gif': ':scarymov:',
      'massacre.gif': ':massacre:',
      'rouleau.gif': ':rouleau:',
      'pastaper.gif': ':pastaper:',
      'boulet.gif': ':boulet:',
      'dehors.gif': ':dehors:',
      'google.gif': ':google:',
      'dvp.png': ':dvp:'
    },
    version = "2.1.0",
    optionsChat = "",
    session,
    lastData,
    a = 0;

function setPostHeader($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj) {
            var query = '';
            var name, value, fullSubName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (var i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (var subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }
            return query.length ? query.substr(0, query.length - 1) : query;
        }
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
}

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/login', {
        templateUrl: 'login.html',
        controller: 'LoginCtrl'
    }).when('/chat', {
        templateUrl: 'chat.html',
        controller: 'ChatCtrl'
    }).otherwise({
        redirectTo: '/login'
    });
}]);

app.service('sharedProperties', function () {
    var data = [];
    var etat = 0;
    var channel = "";

    return {
        getData: function () {
            return data;
        },
        setData: function(value) {
            data = value;
        },
        getSession: function () {
            return session;
        },
        setSession: function (value) {
            session = value;
        },
        getVersion: function () {
            return version;
        },
        getEtat: function () {
            return etat;
        },
        setEtat: function (value) {
            etat = value;
        },
        getChannelActive: function () {
            return channel;
        },
        setChannelActive: function (value) {
            channel = value;
        }
    };
});

app.factory('setMessage', function ($http, sharedProperties, $location) {
    var optionsChat = "";

    var readCookie = function (nom) {
        var deb = document.cookie.indexOf(nom + "=");

        if (deb >= 0) {
            deb += nom.length + 1;
            var fin = document.cookie.indexOf(";", deb);

            if (fin < 0)
                fin = document.cookie.length;

            return unescape(document.cookie.substring(deb, fin));
        }

        return null;
    };

    var setMessage = {
        getData : function (json) {
            sharedProperties.setData(json);
            return $http({
                method: 'POST',
                url: proxyURI.concat('ajax.php'),
                cache: false,
                data: json
            }).success(function (data, status, headers, config) {
                return data;
            }).error(function (data, status, headers, config) { return false; });
        },

        doStatus : function (data) {
            sharedProperties.setData(data);
            sharedProperties.setEtat(data.etat);
            if (data.etat === -1) {
                $location.path('/login');
            }
            else if (data.etat === 0) {
                $location.path('/login');
                document.getElementById("identMessage").classList.add("active");
                document.getElementById("identMessage").innerHTML = data.message;
            }
            else if (data.etat === 2) {
                sharedProperties.setSession(data.session);
            }
            if (firstConnexion === 0) {
                popover('login');
                $location.path('/chat');
            }
        },

        userConnect : function () {
            var pseudo = readCookie("anochat_pseudo");
            var password = readCookie('anochat_motdepasse');
            var mode = 1;

            if (pseudo == null) {
                mode = 0;

                pseudo = document.getElementById("login_pseudo").value;
                password = document.getElementById("login_password").value;

                if (pseudo == "") {
                    document.getElementById('identMessage').classList.add("active");
                    document.getElementById('identMessage').innerHTML = "Vous devez entrer votre identifiant.";
                    return;
                }

                if (password == "") {
                    document.getElementById('identMessage').classList.add("active");
                    document.getElementById('identMessage').innerHTML = "Vous devez entrer votre mot de passe.";
                    return;
                }
            }

            var channel = document.getElementById("login_channel").value;

            if (channel == -1) {
                document.getElementById('identMessage').classList.add("active");
                document.getElementById('identMessage').innerHTML = "Vous devez choisir un salon.";
                return;
            }

            sharedProperties.setChannelActive(channel);

            if (mode == 0) {
                document.getElementById("login_pseudo").value = "";
                document.getElementById("login_password").value = "";
            }

            document.getElementById('identMessage').classList.add("active");
            document.getElementById('identMessage').innerHTML = "Connexion en cours...";
            document.getElementById('login_send').setAttribute("disabled", true);

            return { q: "conn", v: sharedProperties.getVersion(), identifiant: pseudo, motdepasse: password, mode: mode,
                decalageHoraire: new Date().getTimezoneOffset(), options: optionsChat, salon: channel };
        }
    };
    return setMessage;
});

app.factory('loadData', function (sharedProperties, $timeout) {
    var addFunction = function () {
        var users = document.getElementsByClassName("nomConnecte");
        for (user in users) {
            if (users.item(user) !== null) {
                users.item(user).setAttribute("onclick", "changeName(this); popover('about-user'); slideNav('right'); return false;");
            }
        }
    };

    var createUsersList = function (users) {
        var list = document.getElementById('users-list');
        list.innerHTML = users;

        addFunction();
    };

    var createLineChannel = function (channel) {
        var conv = document.getElementById('conv-0');
        var item = document.createElement('div');
        item.setAttribute('class', 'line');
        item.innerHTML = channel;
        conv.appendChild(item);
        console.log(conv.offsetHeight);
        conv.scrollTo = conv.offsetHeight;
        console.log(conv.scrollTop);
    };

    var createPvsElement = function (pvs) {
        var mpList = document.getElementById('msg-private-list');
        var listChild = mpList.children;
        //console.log(listChild);
        angular.forEach(pvs, function (key, value) {
            if (!inArray("pvs-" + key.id, listChild)) {
                var item = document.createElement("li");
                // ici on crée l'onglet de la conv dans le menu de gauche
                item.setAttribute("class", "item new");
                item.setAttribute("id", "pvs-" + key.id);
                item.setAttribute("onclick", "switchConv(" + key.id + ", '" + key.pseudo + "');");
                item.appendChild(document.createTextNode(key.pseudo));
                mpList.appendChild(item);

                // ici on crée la div qui va accueillir la conv pvs
                var parent = document.getElementById('conversations');
                var conv = document.createElement("div");
                conv.setAttribute("id", "conv-" + key.id);
                conv.setAttribute("class", "conv");
                parent.appendChild(conv);
            } else {
                if (!hasClass(document.getElementById("conv-" + key.id), "open-conv")) {
                    document.getElementById("pvs-" + key.id).setAttribute("class", "item new");
                }
            }

            addMsgPvs(key.id, key.html);
        });
    };

    var addMsgPvs = function (id, html) {
        var conv = document.getElementById('conv-' + id);
        var item = document.createElement('div');
        item.setAttribute('class', 'line');
        item.innerHTML = html;
        conv.appendChild(item);
        //conv.scroll(0, conv.style.height);
    };

    var loadData = {
        getData: function ($scope) {
            if (sharedProperties.getData() !== undefined) {
                var chanActive = sharedProperties.getData().nomSalon;
                if (chanActive !== undefined) {
                    switch (chanActive) {
                        case "Développement Applicatif" :
                            $scope.data.nomSalon = "Dev. App.";
                            break;
                        case "Développement Web" :
                            $scope.data.nomSalon = "Dev. Web";
                            break;
                        default :
                            $scope.data.nomSalon = chanActive;
                            break;
                    }
                }

                if (sharedProperties.getData().connectes !== "") {
                    createUsersList(sharedProperties.getData().connectes);
                }

                if (sharedProperties.getData().smileys !== undefined) {
                    $scope.data.smileys = sharedProperties.getData().smileys;
                }

                $timeout(function () {
                    createLineChannel(sharedProperties.getData().salon);
                    if (sharedProperties.getData().pvs.length > 0) {
                        createPvsElement(sharedProperties.getData().pvs);
                    }

                    if (sharedProperties.getData().smileys !== undefined) {
                        var div = document.getElementById('list-smileys-perso');
                        var list = div.getElementsByTagName("a");
                        for (i = 0; i < list.length; i++) {
                            list[i].setAttribute("onclick", "return false;");
                            var link = list[i].getElementsByTagName('img')[0].getAttribute("src");
                            list[i].getElementsByTagName('img')[0].setAttribute("src", proxyURI + link);
                        }
                    }

                    checkNewPvs();
                });
            }
            return $scope.data;
        },

        getChannel: function () {
            var chanActive = sharedProperties.getData().nomSalon.replace(" ", "_");
            var element = document.getElementById('slide-nav-left').getElementsByClassName('item-' + sharedProperties.getChannelActive())[0];
            element.removeAttribute("ng-click");
            element.classList.add("active");
            element.classList.add("new");
            element.setAttribute("id", "chan-0");
            element.setAttribute("name", chanActive);
            element.setAttribute("onclick", "switchConv(0, '" + element.innerHTML + "')");
        }
    };
    return loadData;
});

app.controller('LoginCtrl', function (sharedProperties, setMessage, loadData, $scope) {
    $scope.ngUserConnect = function () {
        var json = setMessage.userConnect();
        if (json !== undefined) {
            setMessage.getData(json).then(function (response) {
                setMessage.doStatus(response.data);
                firstConnexion = 1;
            });
        }
    };
});

app.controller('ChatCtrl', function (sharedProperties, setMessage, loadData, $scope, $sce, $interval, $location) {

    $scope.data = [];

    $scope.data = loadData.getData($scope);
    $scope.data.anoSmileys = anoSmileys;
    $scope.data.proxyURI = proxyURI;

    loadData.getChannel();

    var interval = $interval(function () {
        if (sharedProperties.getEtat() < 1) {
            stopInterval();
        } else {
            setMessage.getData({q: "act", v: sharedProperties.getVersion(), s: sharedProperties.getSession(), a: a++}).then(function (response) {
                setMessage.doStatus(response.data);
                $scope.data = loadData.getData($scope);
            });
        }
    }, 3000);

    var stopInterval = function() {
        $interval.cancel(interval);
    };

    $scope.toTrustedHTML = function (html) {
        return $sce.trustAsHtml(html);
    };

    $scope.logout = function () {
        stopInterval();
        setMessage.getData({ q: "cmd", v: version, s: session, c: "/QUIT", a: a++});
        $location.path("/login");
    };

    $scope.send = function () {
        var texte = document.getElementById("msg-input").value;
        setMessage.getData({ q: "cmd", v: version, s: session, c: texte, a: a++ }).then(function (response) {
            document.getElementById("msg-input").value = "";
            setMessage.doStatus(response.data);
            $scope.data = loadData.getData($scope);
        });
    };

    $scope.keyEnter = function (keyCode) {
        if (keyCode === 13) {
            $scope.send();
        }
    };

    $scope.switchChannel = function (cmd, channel, $event) {
        var chanActive = document.getElementById("chan-0");
        var nameChanActive = chanActive.getAttribute("name");
        chanActive.removeAttribute("onclick");
        chanActive.removeAttribute("name");
        chanActive.removeAttribute("id");
        chanActive.classList.remove("active");
        chanActive.classList.remove("new");
        chanActive.setAttribute("ng-click", "switchChannel('/JOIN', '" + nameChanActive + "', $event);");

        var element = $event.target;
        element.removeAttribute("ng-click");
        element.classList.add("active");
        element.classList.add("new");
        element.setAttribute("id", "chan-0");
        element.setAttribute("name", channel);
        element.setAttribute("onclick", "switchConv(0, '" + element.innerHTML + "')");

        setMessage.getData({ q: "cmd", v: version, s: session, c: cmd + " " + channel, a: a++}).then(function (response) {
            document.getElementById("msg-input").value = "";
            setMessage.doStatus(response.data);
            $scope.data = loadData.getData($scope);
        });
    };

    $scope.myNavSwipeRight = function () {
        if (!hasClass(document.getElementById('slide-nav-left'), 'open-nav') && !hasClass(document.getElementById('slide-nav-right'), 'open-nav')) {
            slideNav('left');
        } else if (!hasClass(document.getElementById('slide-nav-left'), 'open-nav') && hasClass(document.getElementById('slide-nav-right'), 'open-nav')) {
            slideNav('right');
        }
    };

    $scope.myNavSwipeLeft = function () {
        if (hasClass(document.getElementById('slide-nav-left'), 'open-nav') && !hasClass(document.getElementById('slide-nav-right'), 'open-nav')) {
            slideNav('left');
        } else if (!hasClass(document.getElementById('slide-nav-left'), 'open-nav') && !hasClass(document.getElementById('slide-nav-right'), 'open-nav')) {
            slideNav('right');
        }
    };

    $scope.myPopoverSwipeDown = function () {
        popover('about-user');
    };
});
