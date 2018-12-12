import React from 'react'
import Link from 'next/link'
import defaultPage from 'hocs/defaultPage'
import Header from 'components/Header'
import ListTitle from 'components/ListTitle'
import ListItem from 'components/ListItem'
import request from 'helpers/request'
import { get } from 'lodash'

class Index extends React.Component {
  static async getInitialProps () {
    const result = await request('article')
    return {
      list: result.list || []
    }
  }

  static async getHeadSetting (pageProps) {
    return {
      title: '首页',
    }
  }

  render () {
    const { list } = this.props
    return (
      <div>
        <Header />
        <ListTitle>最新文章</ListTitle>
        {list.map((item, key) => (
          <ListItem
            url={`/p/${item._id}`}
            key={key}
            title={item.title}
            description={item.subTitle}
            tag={get(item.category, 'name')}
          />
        ))}
      </div>
    )
  }
}

export default defaultPage(Index)
