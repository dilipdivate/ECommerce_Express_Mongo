class ApiFeatures {
  // query -- findOne, insertMany
  //queryStr -- value we are trying to find like samosa
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    // console.log(this.queryStr);
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: '^' + this.queryStr.keyword,
            $options: 'i',
          },
        }
      : {};
    // console.log(keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    // console.log(queryCopy);
    //Removing some fields for category

    const removeFields = ['keyword', 'page', 'limit'];
    removeFields.forEach((key) => delete queryCopy[key]);
    // console.log(queryCopy);

    // Filter for price and Rating

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte)\b/g, (key) => `$${key}`);
    // console.log(queryStr);

    this.query = this.query.find(JSON.parse(queryStr));

    // console.log(queryStr);

    // this.query = this.query.find(queryCopy);
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1); // 50 - 10
    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

export default ApiFeatures;
