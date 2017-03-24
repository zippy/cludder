var Cludder = {posts:{},users:{},follows:{},nick:""};

function send(fn,data) {
    var result;
    result = $.post("/fn/cludder/"+fn, data, function(v) {return v})
    .error(function(response){console.log("response failed: " + response.responseText)})
    console.log("result: " + result)
    return result;
};

function getProfile() {
    Cludder.me = send("appProperty", "App_Agent_Hash")
    Cludder.nick = send("getHandle", Cludder.me);
    $("#nick").html(Cludder.nick);
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
    post.nick = Cludder.nick;
    id = post.stamp.toString()+nick;
    Cludder.posts[id] = post;
    $("#meows").prepend(makePostHTML(id,post,Cludder.nick));
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
    getPosts(Cludder.me)
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
        Cludder.posts[id] = post;
        displayPosts();
    }
}

function getUsers() {
    arr = send("get",{what:"users"})
    for (var i = 0, len = arr.length; i < len; i++) {
        var user = JSON.parse(arr[i].C);
        // don't cache yourself!
        if (user.nick != Cludder.nick) {
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
