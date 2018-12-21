import React, { Fragment } from 'react'
import Link from 'next/link'
import defaultPage from 'hocs/defaultPage'
import Header from 'components/Header'
import ListTitle from 'components/ListTitle'
import ListItem from 'components/ListItem'
import request from 'helpers/request'
import I18n, { Trans } from 'helpers/I18n'
import { get } from 'lodash'

import { connect } from 'react-redux'
import { loadData, startClock, tickClock } from '../store/actions'

class Index extends React.Component {
  static async getInitialProps() {
    const result = await request('article')
    return {
      list: result.list || [],
    }
  }

  static async getSettings(pageProps) {
    return {
      title: '首页',
    }
  }

  componentDidMount() {
    this.props.dispatch(startClock())
  }

  render() {
    const { list } = this.props

    return (
      <Fragment>
        <Header />
        <ListTitle>
          <I18n id="latest articles" />
        </ListTitle>
        {list.map((_, key) => (
          <ListItem
            url={`/p/${_._id}`}
            key={key}
            title={_.title}
            description={_.subTitle}
            date={_.createDate}
            tag={get(_.category, 'name')}
            category={get(_.category, 'name')}
            cover={_.cover}
            author={_.originalAuthor || get(_.author, 'nickname')}
          />
        ))}
      </Fragment>
    )
  }
}

export default connect()(defaultPage(Index))
