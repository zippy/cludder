var Cludder = {posts:{},users:{},follows:{},nick:""};

function send(fn,data,resultFn) {
    $.post(
        "/fn/cludder/"+fn,
        data,
        function(response) {
            console.log("response: " + response);
            resultFn(response);
        }
    ).error(function(response) {
        console.log("response failed: " + response.responseText);
    })
    ;
};

function getProfile() {
    send("appProperty","App_Agent_Hash", function(me) {
            send("getHandle",me,function(data) {
                Cludder.nick = data;
                $("#nick").html(data);
                getMyPosts();
        });
    });
}

function addPost() {
    var now = new(Date);
    var post = {
        message:$('#meow').val(),
        stamp: now.valueOf()
    };
    send("post",JSON.stringify(post),function(data) {
        post.key = data; // save the key of our post to the post
        post.nick = Cludder.nick;
        var id = cachePost(post);
        $("#meows").prepend(makePostHTML(id,post,Cludder.nick));
    });
}

function follow(w) {
    var follow = {
        whom:w
    };
    send("follow",follow,function(data) {
        follow.key = data; // save the key of our follow
        var id = cacheFollow(follow);
    });
}

function makePostHTML(id,post) {
    var d = Date(post.stamp);
    return '<div class="meow" id="'+id+'"><div class="stamp">'+d+'</div><div class="user">'+post.nick+'</div><div class="message">'+post.message+'</div></div>';
}

function makeUserHTML(user) {
    return '<div class="user">'+user.nick+'</div>';
}

function makeResultHTML(result) {
    var id;
    return '<div class="search-result" id="'+id+'"><div class="user">'+result.nick+'</div></div>';
}

function getMyPosts() {
        send("appProperty", "App_Agent_Hash", function(me) {
            getPosts(me);
        });
}

function getPosts(by) {
    send("getPostsBy",by,function(arr) {

        arr = JSON.parse(arr);
        console.log("arr: " + JSON.stringify(arr));

        // if we actually get something, then get the handle and
        // add it to the posts objects before caching.
        var len = len = arr.length;
        if (len > 0) {
            send("getHandle", by, function(author_handle) {
                for (var i = 0; i < len; i++) {
                    console.log("arr[i]: " + JSON.stringify(arr[i]));
                    var post = JSON.parse(arr[i].post);
                    post.nick = author_handle;
                    var id = cachePost(post);
                    displayPosts();
                    //            $("#meows").prepend(makePost(id,post));
                }
            });
        }
    });
}

function getUsers() {
    send("get",{what:"users"},function(arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            var user = JSON.parse(arr[i].C);
            // don't cache yourself!
            if (user.nick != Cludder.nick) {
                cacheUser(user);
            }
        }
    });
}

function getFollows(w) {
    send("get",{what:"follows",whom:w},function(arr) {
        for (var i = 0, len = arr.length; i < len; i++) {
            var follow = JSON.parse(arr[i].C);
            cacheFollow(follow);
        }
    });
}

function cachePost(p) {
    //console.log("Caching:"+JSON.stringify(p));
    var id = p.stamp.toString()+p.nick;
    Cludder.posts[id] = p;
    return id;
}

function cacheUser(u) {
    Cludder.user[u.nick] = u;
}

function cacheFollow(f) {
    Cludder.follows[f.whom] = f;
}

function displayPosts() {
    var keys = [],
    k, i, len;

    for (k in Cludder.posts) {
        if (Cludder.posts.hasOwnProperty(k)) {
            keys.push(k);
        }
    }

    keys.sort().reverse();

    len = keys.length;

    $("#meows").html("");
    for (i = 0; i < len; i++) {
        k = keys[i];
        var post = Cludder.posts[k];
        $("#meows").append(makePostHTML(k,post));
    }
}

function doSearch() {
    $('#search-results').fadeIn();
    $("#people-results").html("");
    $("#people-results").append(makeResultHTML({nick:"joey"}));
    $("#people-results").append(makeResultHTML({nick:"jane"}));
}

function hideSearchResults() {
    $('#search-results').fadeOut();
}

function searchTab(tab) {
    var tabs = $('.search-results-data');
    var len = tabs.length;
    for (i = 0; i < len; i++) {
        var t= tabs[i];
        var tj = $(t);
        var cur = t.id.split("-")[0];
        var tabj = $("#"+cur+"-tab");
        if (tab == cur) {
            tj.slideToggle();
            tabj.addClass('active-tab');
        }
        else {
            tj.slideToggle();
            tabj.removeClass('active-tab');
        }
    }
}
