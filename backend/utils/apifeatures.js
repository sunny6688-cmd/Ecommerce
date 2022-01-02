class ApiFeatures {
    constructor(query,queryString)
    {
        this.query=query;
        this.queryString=queryString;
    }
    search(){
        const keyword = this.queryString.keyword 
        ?{
            name:{
                $regex: this.queryString.keyword,
                $options: 'i'
            }
        }:{};

        this.query = this.query.find({...keyword});
        return this;
    }
    filter(){
        const queryFilter = {...this.queryString};
        const removeKeys = ["keyword","page","limit"];

        removeKeys.forEach(key=>delete queryFilter[key]);

        //Filter for price and rating.

        let queryString = JSON.stringify(queryFilter);
        queryString = queryString.replace(/\b(gt|gte|lt|lte)\b/g, (key)=> `$${key}`);
        
        this.query = this.query.find(JSON.parse(queryString));

        return this;
    }
    pagination(resultPerPage)
    {
        const currentPage = Number(this.queryString.page) || 1;

        const pagesToSkip = resultPerPage * (currentPage-1);
        this.query = this.query.limit(resultPerPage).skip(pagesToSkip);

        return this;
    }
};

module.exports = ApiFeatures;