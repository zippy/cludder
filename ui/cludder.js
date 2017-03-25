var cache = {posts:{},users:{},follows:{}}
var me = {nick:""}

function send(fn,data) {
    var result;
    result = $.post("/fn/cludder/"+fn, data, function(v) {return v})
    .error(function(response){console.log("response failed: " + response.responseText)})
    console.log("result: " + result)
    return result;
};

var App = {Agent:{Hash:send("appProperty", "App_Agent_Hash")}};

function getProfile() {
    me.nick = send("getHandle", App.Agent.Hash);
    $("#nick").html(me.nick);
    getMyPosts();
}

function addPost() {
    var now = new(Date);
    var post = {
        message:$('#meow').val(),
        stamp: now.valueOf()
    };
    data = send("post",post)
    post.key = data; // save the key of our post to the post
    post.nick = me.nick;
    id = post.stamp.toString()+nick;
    cache.posts[id] = post;
    $("#meows").prepend(makePostHTML(id,post,me.nick));
}

function follow(w) {
    var follow = {
        whom:w
    };
    data = send("follow",follow)
    follow.key = data; // save the key of our follow
    var id = cacheFollow(follow);
}

function makePostHTML(id,post) {
    return '<div class="meow" id="'+id+'"><div class="user">'+post.nick+'</div><div class="message">'+post.message+'</div></div>';
}

function makeUserHTML(user) {
    return '<div class="user">'+user.nick+'</div>';
}

function getMyPosts() {
    getPosts(App.Agent.Hash)
}

function getPosts(by) {
    posts_raw = send("getPostsBy",by)
    console.log("posts: " + posts_raw)
    posts = JSON.parse(posts_raw)
    for (var i = 0, len = posts.length; i < len; i++) {
        console.log("posts[i]: " + JSON.stringify(posts[i]))
        var post = posts[i].E.C;
        post.nick = send("getHandle", by)
        id = post.stamp.toString()+nick;
        cache.posts[id] = post;
        displayPosts();
    }
}

function getUsers() {
    arr = send("get",{what:"users"})
    for (var i = 0, len = arr.length; i < len; i++) {
        var user = JSON.parse(arr[i].C);
        // don't cache yourself!
        if (user.nick != me.nick) {
            cacheUser(user);
        }
    }
}

function getFollows(w) {
    arr = send("get",{what:"follows",whom:w})
    for (var i = 0, len = arr.length; i < len; i++) {
        var follow = JSON.parse(arr[i].C);
        cacheFollow(follow);
    }
}

function cacheUser(u) {
    cache.users[u.nick] = u;
}

function cacheFollow(f) {
    cache.follows[f.whom] = f;
}

function displayPosts() {
    var keys = [],
    k, i, len;

    for (k in cache.posts) {
        if (cache.posts.hasOwnProperty(k)) {
            keys.push(k);
        }
    }

    keys.sort().reverse();

    len = keys.length;

    $("#meows").html("");
    for (i = 0; i < len; i++) {
        k = keys[i];
        var post = cache.posts[k];
        $("#meows").append(makePostHTML(k,post));
    }
}
