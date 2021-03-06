import React from 'react/addons'
import _ from 'lodash'
import helpers from '../../components/helpers'
import ItemDetailMixin from './detail-mixin'
import Subitem from './item-subitem'
import ShortSubitems from '../../components/subitems'
import {State} from 'react-router'
import ProductActions from '../../../actions/product-actions'
import ItemActions from '../../../actions/item-actions'

var ItemSubitems = React.createClass({
  mixins: [State, ItemDetailMixin],

  propTypes: {
    item: React.PropTypes.object,
    productId: React.PropTypes.number,
    members: React.PropTypes.array,
    subitems: React.PropTypes.array,
    setSubitem: React.PropTypes.func
  },

  getInitialState() {
    return {
      subitemsStates: {}
    }
  },

  toggleSubitem(id, ev) {
    let subitemsStates = _.cloneDeep(this.state.subitemsStates)
    subitemsStates[id].header = !subitemsStates[id].header

    this.setState({subitemsStates: subitemsStates})
  },

  updateSubitem(subitem, ev) {
    let status
    if (_.contains(['someday', 'backlog', 'in-progress'], subitem.status)) {
      status = 'accepted'
    } else if (_.contains(['completed', 'accepted'], subitem.status)) {
      status = 'in-progress'
    }

    ProductActions.updateItem(
      subitem.product.id,
      subitem.number,
      _.assign({}, subitem, { status }),
      { wait: false }
    )
  },

  toggleActionControl(subitem, type) {
    let id = subitem.number
    let subitemsStates = _.cloneDeep(this.state.subitemsStates)
    subitemsStates[id].header = true
    subitemsStates[id].controls = this.controlToggle(subitemsStates[id].controls, type)

    this.setState({subitemsStates: subitemsStates})
  },

  maxId() {
    let maxIdSubitem = _.max(this.props.subitems, (subitem) => {
      return subitem.number
    })

    return maxIdSubitem.number.toString().length
  },

  subitems() {
    return _.map(this.props.subitems, (subitem, index) => {
      let subitemState = this.state.subitemsStates[subitem.number]

      /*
        Note: Index prop is important for checkbox and label key in subitem header
      */
      return (
        <Subitem   key={index}
                 index={index}
               subitem={subitem}
               members={this.props.members}
   toggleActionControl={this.toggleActionControl}
         toggleSubitem={this.toggleSubitem}
         updateSubitem={this.updateSubitem}
            setSubitem={this.props.setSubitem}
                 maxId={this.maxId()}
            {...subitemState} />
      )
    })
  },

  shortSubitems() {
    return (
      <ShortSubitems
        item={this.props.item}
        subitems={this.props.subitems}
        productId={this.props.productId}
        parentId={this.props.productId}
      />
    )
  },

  subheaderOpen(id) {
    let subitemsStates = _.values(this.state.subitemsStates[id])
    return _.contains(subitemsStates, true)
  },

  addNewSubitemState(newSubitems) {
    let requiresUpdate = false
    let subitemsStates = _.cloneDeep(this.state.subitemsStates)
    let existingSubitems = _.keys(subitemsStates)

    _.each(newSubitems, function(item) {
      if (!_.contains(existingSubitems, item.number.toString())) {
        requiresUpdate = true
        subitemsStates[item.number] = {
          header: false,
          controls: {
            status: false,
            assignee: true,
            score: false
          }
        }
      }
    })

    if (requiresUpdate) {
      this.setState({subitemsStates: subitemsStates})
    }
  },

  componentWillReceiveProps(nextProps) {
    let newSubitems = _.difference(nextProps.subitems, this.props.subitems)

    if (newSubitems) {
      this.addNewSubitemState(nextProps.subitems)
    }
  },

  collapseSubitems() {
    let subitemsStates = _.cloneDeep(this.state.subitemsStates)
    _.each(subitemsStates, function(val, key) {
      subitemsStates[key].header = false
    })

    this.setState({subitemsStates: subitemsStates})
  },

  createSubitem(ev) {
    ev.preventDefault()
    let node = this.refs.addItemInput.getDOMNode()
    let title = node.value

    ItemActions.addItem(this.props.productId, {
      title,
      type: 'task',
      parent: this.props.item.number
    }).then(function() {
      node.value = ''
    })
  },

  render: function() {
    let collapseAllLink = this.props.subitems ? <a className="collapse__subitems hidden-xs" onClick={this.collapseSubitems}>collapse all</a> : ''
    let subitems = this.props.subitems ? this.subitems() : []
    let shortSubitems = this.props.item && this.props.subitems ? this.shortSubitems() : []

    return (
      <div className="col-xs-12 section subitems">
        <div className="col-xs-12">
          <div className="header">
            <div className="title">{helpers.toTitleCase('sub-items')}</div>
            {collapseAllLink}
            <div className="sep"></div>
          </div>
        </div>
        <div className="hidden-xs">
          <div className="col-xs-12">
            {subitems}
          </div>
          <div className="col-xs-12 add-subitem">
            <form className="subitems__add-subitem" onSubmit={this.createSubitem}>
              <input ref="addItemInput" type="text" placeholder={"Add new sub-task"} className="form-control" />
              <button className="btn btn-default">+</button>
            </form>
          </div>
        </div>
        <div className="col-xs-12 visible-xs">
          {shortSubitems}
        </div>
      </div>
    )
  }
})

export default ItemSubitems
