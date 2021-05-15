let chai = require('chai');
let should = chai.should();
let axios = require('axios');
const utils = require('../lib/util');
const configData = require("../confiq.json");

describe('3.OMDB Search API Tests', async () => {

    const apiKey = configData['apiKey']
    const baseUrl = configData['baseUrl']
    const searchQuery = 'thomas'

    let res;

    before(async () => {
        res = await axios.get(baseUrl, {params: {s: searchQuery, apikey: apiKey}});
        res.status.should.equal(200);
    })

    it('Verify all titles are a relevant match', async () => {
        let search_arr = utils.getInnerJsonObjFromSearch(res, 'Title')

        search_arr.every(el => el.should.include(searchQuery))
    });

    it('Verify values are all of the correct object class', async () => {
        res.data['Search'].should.to.be.an.instanceof(Array);
        res.data['Search'].every(el => el.should.to.be.an.instanceof(Object));
    });

    it('Verify keys include Title, Year, imdbID, Type, and Poster for all records in the response', async () => {
        res.data['Search'].every(el => el.should.to.have.all.keys('Title', 'Year', 'imdbID', 'Type', 'Poster'))
    });

    it('year matches correct format', () => {
        let search_arr = utils.getInnerJsonObjFromSearch(res, 'Year')

        search_arr.forEach(el => {
            let year = el.split('–')
            if (year.length === 2){
                year.every(y => y.should.to.match(/^\d{4}$/))
            } else {
                year[0].should.to.match(/^\d{4}$/)
            }
        })
    });

});
