class Utils {

    getInnerJsonObjFromSearch(response, key){
        let arr = []
        response.data['Search'].forEach(function (search) {
            arr.push(search[key].toLowerCase())
        })
        return arr
    }

}

module.exports = new Utils();