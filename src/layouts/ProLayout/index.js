import BasicLayout, { BasicLayoutProps } from './BasicLayout'
import BlockLayout from './BlockLayout'
import PageHeaderWrapper from './components/PageHeaderWrapper'
import SiderMenuWrapper from './components/SiderMenu'
import GlobalFooter from './components/GlobalFooter'
// import SettingDrawer from './components/SettingDrawer'
// import DocumentTitle from './components/DocumentTitle'
import { updateTheme } from './utils/dynamicTheme'

export { GlobalFooter, PageHeaderWrapper, SiderMenuWrapper, BlockLayout, /*  DocumentTitle, */ BasicLayoutProps, updateTheme }

export default BasicLayout
