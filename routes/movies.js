const express = require('express');
const router = express.Router();
const axios = require("axios");
const yifyEp = process.env.TORRENT_URL + "?limit=" + process.env.TORRENT_REQ_LIMIT;
const year = new Date().getFullYear();

var ssn;

router.get('/', async (req, res) => {
    
    ssn = req.session;
    
    const recentMovies = Array();
    var page = 1;
    const perPage = 18;
    while(recentMovies.length < perPage) {
        var result = await fetchYify(req, res, page);
        page++;
        if (result == null || result.data == null || result.data.movies == null) continue;
        for(const movie of result.data.movies) {
            if(movie.yt_trailer_code.length > 0 && (movie.year == (year - 1) || movie.year == year)) {
                movie.language = await getLanguage(movie.language);
                recentMovies.push(movie);
                if(recentMovies.length == perPage) {
                    ssn.lastId = movie.id;
                    ssn.lastPage = page-1;
                    break;
                }
            }
        }
    }
    res.render('', {movies: recentMovies, perPage: perPage});
})

router.get('/loadmore', async (req, res) => {
    
    ssn = req.session;
    
    const recentMovies = Array();
    var page = ssn.lastPage;
    const perPage = 18;
    var isStoreNew = false;
    while(recentMovies.length < perPage) {
        var result = await fetchYify(req, res, page);
        page++;
        if (result == null || result.data == null || result.data.movies == null) continue;
        for(const movie of result.data.movies) {
            if(movie.yt_trailer_code.length > 0 && (movie.year == (year - 1) || movie.year == year)) {
                if (movie.id == ssn.lastId) {
                    isStoreNew = true;
                    continue;
                }
                if (isStoreNew) {
                    movie.language = await getLanguage(movie.language);
                    recentMovies.push(movie);
                    if(recentMovies.length == perPage) {
                        ssn.lastId = movie.id;
                        ssn.lastPage = page-1;
                        break;
                    }
                }
            }
        }
    }
    res.render('loadmore.ejs', {movies: recentMovies, perPage: perPage});
})

async function fetchYify(req, res, page) {
    return await axios.get(yifyEp + "&page="+page).then(
        response => {
            return response.data;
        }
    ).catch( err => {
        console.log(err);
        res.render('movies/err', {error: err});
    });
};

async function getLanguage(code){
    const lang = new Intl.DisplayNames(['en'], {type: 'language'});
    return lang.of(code);
}

module.exports = router;