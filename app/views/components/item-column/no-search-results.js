import React from 'react';

var NoSearchResults = React.createClass({
  clearFilters() {
    console.log('Clear Filters Dependant on Mobile Nav Land');
  },

  render() {
    return (
      <div className='no-search-results'>
        <div className="content">
          <div className="row">
            <div className="col-sm-12">
              <h1>No Results!</h1>
              <h5>Try filtering again or reset your filters.</h5>
            </div>
            <div className="item-card__title col-sm-12">
              <button style={ {width: "100%"} } className="btn btn-primary" onClick={this.clearFilters}>Clear Filters</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
})

module.exports = NoSearchResults;
