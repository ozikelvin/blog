var express = require("express");
var overRide = require('method-override');
var  bodyparser = require("body-parser");
var  mongoose =  require('mongoose');
var expressSanitizer = require("express-sanitizer");
var    port = 58703;


var  app = express();


    app.set('view engine', 'ejs');
    app.use(bodyparser.urlencoded({extended:true}));
    app.use(expressSanitizer());
    app.use(express.static('public'));
    app.use(overRide('_method'));

    var url = 'mongodb://localhost:27017/Blogdb';
    mongoose.connect(url, {
        useNewUrlParser: true,
    useUnifiedTopology: true
    });

    var blogSchema = new mongoose.Schema({
        title:String,
        image:String,
        body:String,
        date: {type: Date, default:Date.now}
    });

    var Blog = mongoose.model('blog', blogSchema);


    app.get('/', (req,res)=>{
        res.redirect('/blog');
    });
    app.get('/blog',(req,res)=>{
        Blog.find({}, (err, blog)=>{
            if(err){
                console.log(err);
            }
            else{
                res.render('index', {blog:blog});
            }
        });
    });
    app.post('/blog', (req,res)=>{
        req.body.blog.body = req.sanitize(req.body.blog.body);
        Blog.create(req.body.blog, (err, newblog)=>{
            if(err){
                console.log(err);
            }
            else{
                res.redirect('/blog');
            }
        });
    });

    app.post('/clean', (req,res)=>{
        var clean = req.body.clean;
        Blog.remove({title:clean}, (err, deleted)=>{
            if(err){
                console.log(err);
            }
            else{
                res.redirect('/blog');
            }
        });
    });


    app.get('/blog/new', (req,res)=>{
        res.render('new');
    });

// SHOW PAGE
app.get('/blog/:id', (req,res)=>{
    Blog.findById(req.params.id, (err, newBlog)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render("show", {blog:newBlog});
        }
    });
});
// Edit Page
app.get('/blog/:id/edit', (req, res)=>{
    Blog.findById(req.params.id, (err, Edit)=>{
        if(err){
            res.redirect('/index');
        }
        else{
            res.render('edit', {blog:Edit});
        }
    });
});

// Update Blog

app.put("/blog/:id", (req, res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, update)=>{
    if(err){
        res.redirect('/blog');
    }
    else{
        res.redirect("/blog/" + req.params.id);
    }
  });
});

app.delete('/blog/:id', (req,res)=>{
    Blog.findByIdAndDelete(req.params.id, (err, Deleted)=>{
        if(err){
            res.redirect('/blog');
        }
        else{
            res.redirect('/blog');
        }
    })
})



app.listen(process.env.PORT || port, ()=>{
    console.log("Server Has Started");
});
