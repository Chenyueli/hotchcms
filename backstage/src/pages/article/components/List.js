import React from 'react'
import { Table } from 'antd'
import { Link } from 'dva/router'
import styles from './List.less'

const List = ({ ...tableProps }) => {
  const columns = [
    {
      title: '封面',
      dataIndex: 'cover',
      className: styles.image,
      width: 64,
      render: text => text && <img alt="Feture" width={26} src={text} />,
    }, {
      title: '标题',
      dataIndex: 'title',
      render: (text, record) => <Link to={`article/${record._id}`}>{text || record._id}</Link>,
    }, {
      title: '作者',
      dataIndex: 'author',
    }, {
      title: '分类',
      dataIndex: 'category.name',
    }, {
      title: '标签',
      dataIndex: 'tags',
    }, {
      title: 'Visibility',
      dataIndex: 'visibility',
    }, {
      title: '评论数',
      dataIndex: 'comments',
    }, {
      title: '浏览数',
      dataIndex: 'viewNum',
    }, {
      title: '创建日期',
      dataIndex: 'createDate',
    }, {
      title: '最后更新日期',
      dataIndex: 'updateDate',
    },
  ]

  return (
    <div>
      <Table
        {...tableProps}
        bordered
        scroll={{ x: 1200 }}
        columns={columns}
        simple
        className={styles.table}
        rowKey={record => record._id}
      />
    </div>
  )
}

export default List
