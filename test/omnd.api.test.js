const chai = require('chai');
const should = chai.should();
const axios = require('axios');
const utils = require('../lib/util');
const configData = require("../confiq.json");

describe('OMDB API Tests', () => {

    const apiKey = configData['apiKey']
    const baseUrl = configData['baseUrl']

    it('1.Verify request with valid apiKey return 200', async () => {
        let imdbId = 'tt3896198'

        const res = await axios.get(baseUrl, {params: {i: imdbId, apikey: apiKey}});

        res.status.should.equal(200);
        res.data.should.not.be.null;
    });

    it('2.Verify request without valid apiKey return appropriate message', async () => {
        let imdbId = 'tt3896198'

        try {
            await axios.get(baseUrl, {params: {i: imdbId}});
        } catch (error) {
            error.response.status.should.equal(401);
            error.response.data['Error'].should.equal('No API key provided.');
        }
    });

    it('4.Verify request by I params on page 1 is accessible via imdbID', async () => {
        let searchQuery = 'Star', pageNumber = 1

        const res = await axios.get(baseUrl, {params: {s: searchQuery, apikey: apiKey, page: pageNumber}});
        res.status.should.equal(200);

        let imdb_arr = utils.getInnerJsonObjFromSearch(res, 'imdbID')

        for (const el of imdb_arr) {
            const res = await axios.get(baseUrl, {params: {i: el, apikey: apiKey}})
            res.status.should.equal(200);
        }
    });

    it('5.Verify none of the poster links on page 1 are broken', async () => {
        let searchQuery = 'Lia', pageNumber = 1

        const res = await axios.get(baseUrl, {params: {s: searchQuery, apikey: apiKey, page: pageNumber}});
        res.status.should.equal(200);

        let poster_arr = utils.getInnerJsonObjFromSearch(res, 'Poster')

        for (const el of poster_arr) {
            try {
                const res = await axios.get(el)
                res.status.should.not.be.equal(404);
            } catch (error) {
                error.response.status.should.equal(200);
            }
        }
    });

    it('Verify there are no duplicate records across the first 5 pages', async () => {
        let searchArr = [], searchSet = new Map(), searchQuery = 'Mama'

        for (let i = 1; i <= 5; i++) {
            const res = await axios.get(baseUrl, {params: {s: searchQuery, apikey: apiKey, page: i}});
            res.status.should.equal(200);

            res.data['Search'].forEach(function (search) {
                searchArr.push(search)
            })
        }

        searchArr.forEach( function( item ) {
            searchSet.set(JSON.stringify(item), item);
        });

        let duplicateCount = searchArr.length - searchSet.size

        duplicateCount.should.equal(0);
    });

    it('7.Verify request with type return appropriate object', async () => {
        let tQuery = 'Guardians', expectedType = 'series'

        const res = await axios.get(baseUrl, {params: {t: tQuery, apikey: apiKey, type: expectedType}});

        res.status.should.equal(200);
        res.data['Type'].should.equal(expectedType);
    });

});
