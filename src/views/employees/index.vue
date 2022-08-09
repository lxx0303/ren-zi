<template>
  <div class="dashboard-container">
    <div class="app-container">
      <ToolBar>
        <template #before>
          <span>共50条记录</span>
        </template>
        <template #after>
          <el-button
            size="mini"
            type="primary"
            @click="$router.push('/import')"
          >导入</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="exportToexcel"
          >导出</el-button>
          <el-button
            size="mini"
            type="warning"
            @click="isShowAddEmployee = true"
          >新增员工</el-button>
        </template>
      </ToolBar>
      <!-- 表格 -->
      <el-card>
        <el-table border :data="list" style="width: 100%">
          <el-table-column type="index" label="序号" width="180" sortable="" />
          <el-table-column
            prop="username"
            label="姓名"
            width="180"
            sortable=""
          />
          <el-table-column label="头像" width="180">
            <template v-slot="{ row }">
              <el-row type="flex" justify="center">
                <el-avatar
                  :src="row.staffPhoto"
                  style="width: 80px; height: 80px"
                  @click.native="showQrCode(row.staffPhoto)"
                >
                  <img
                    src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fimg2.doubanio.com%2Fview%2Frichtext%2Flarge%2Fpublic%2Fp161916213.jpg&refer=http%3A%2F%2Fimg2.doubanio.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1662273578&t=8cfca8a130fa8057ee34a98fad1dd7e9"
                    alt=""
                  >
                </el-avatar>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column
            prop="workNumber"
            label="工号"
            width="180"
            sortable=""
          />
          <el-table-column
            :formatter="formatter"
            prop="formOfEmployment"
            label="聘用形式"
            width="180"
            sortable=""
          />
          <el-table-column
            prop="departmentName"
            label="部门"
            width="180"
            sortable=""
          />
          <el-table-column label="入职时间" width="180" sortable="">
            <template v-slot="{ row }">
              {{ row.timeOfEntry | formatDate }}
            </template>
          </el-table-column>
          <el-table-column
            prop="enableState"
            label="账户状态"
            width="180"
            sortable=""
          />
          <el-table-column label="操作" sortable="" fixed="right" width="280">
            <template v-slot="{ row }">
              <el-button
                type="text"
                size="small"
                @click="$router.push(`/employees/detail/${row.id}`)"
              >查看</el-button>
              <el-button type="text" size="small">转正</el-button>
              <el-button type="text" size="small">调岗</el-button>
              <el-button type="text" size="small">离职</el-button>
              <el-button
                type="text"
                size="small"
                @click="editRole(row.id)"
              >角色</el-button>
              <el-button
                type="text"
                size="small"
                @click="del(row.id)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页组件 -->
        <el-row
          type="flex"
          justify="center"
          align="middle"
          style="height: 60px"
        >
          <el-pagination
            layout="prev, pager, next"
            :total="total"
            :page-size="page.size"
            :current-page="page.page"
            @current-change="changeCurrent"
          />
        </el-row>
      </el-card>
      <el-dialog title="二维码" :visible.sync="showAvatar" @opened="showQrCode">
        <el-row type="flex" justify="center">
          <canvas ref="canvas" />
        </el-row>
      </el-dialog>
    </div>
    <AddEmployee
      v-model="isShowAddEmployee"
      :is-show-add-employee.sync="isShowAddEmployee"
    />
    <EditDialog
      ref="roleRef"
      :current-id="currentId"
      :show-dialog.sync="showDialog"
    />
  </div>
</template>

<script>
import ToolBar from '@/components/ToolBar'
import EmployeeEnum from '@/api/constant/employees'
import { getEmployeeList, delEmployee } from '@/api/employees'
import AddEmployee from '@/views/employees/components/add-employee.vue'
import { formatDate } from '@/filters'
import qrCode from 'qrcode'
import EditDialog from '@/views/employees/components/assign-role.vue'

export default {
  components: { ToolBar, AddEmployee, EditDialog },
  data() {
    return {
      showDialog: false,
      showAvatar: false,
      // 弹层
      isShowAddEmployee: false,
      currentId: '',

      loading: false,
      list: [], // 接数据的
      total: 0, // 总数
      page: {
        page: 1, // 当前页码
        size: 10
      }
    }
  },
  created() {
    this.getEmpList()
  },
  methods: {
    async editRole(id) {
      await this.$refs.roleRef.getCurrentRoleId(id)
      this.currentId = id

      this.showDialog = true
    },
    showQrCode(url) {
      console.log(url)
      this.showAvatar = true
      this.$nextTick(() => {
        qrCode.toCanvas(this.$refs.canvas, url)
      })
    },
    async exportToexcel() {
      const headers = {
        姓名: 'username',
        手机号: 'mobile',
        入职日期: 'timeOfEntry',
        聘用形式: 'formOfEmployment',
        转正日期: 'correctionTime',
        工号: 'workNumber',
        部门: 'departmentName'
      }
      // 使用魔法注释
      // webpackChunkName:'文件名'
      const { export_json_to_excel } = await import(
        /* webpackChunkName:'export2Excel' */
        '@/utils/Export2Excel'
      )
      const { rows } = await getEmployeeList({ page: 1, size: this.total })
      const resData = this.formatterData(rows, headers)

      export_json_to_excel({
        header: Object.keys(headers), // 表头 必填
        data: resData, // 具体数据 必填
        filename: 'excel-list', // 非必填
        autoWidth: true, // 非必填
        bookType: 'xlsx' // 非必填
      })
    },
    // 该方法负责将数组转化成二维数组
    formatterData(rows, headers) {
      /** 遍历原始rows数据
       * 返回的值魏数组
       * 顺序需要和headers的key一一对应
       * 直接map  >>>>  Object.keys(headers)
       * 可以拿到遍历每一项的中文key
       * 中文key  》》 映射表  >>>英文的key   >>>>   通过item可以找到具体数据进行返回
       */
      return rows.map((item) => {
        // item 为对象 ->
        // 替换成数组即可 ->
        // 数组的结构要和headers对应起来 ->
        return Object.keys(headers).map((key) => {
          // key -> 中文的key
          // 预期 -> 返回当前项的值
          // 值在哪？-> item为真实的数据对象 -> 取到正确的值返回即可
          if (['timeOfEntry', 'correctionTime'].includes(headers[key])) {
            // 格式化日期 -> 已经定义过过滤器直接使用即可
            return formatDate(item[headers[key]])
          } else if (headers[key] === 'formOfEmployment') {
            // 需要引入EmployeeEnum常量进行处理
            return EmployeeEnum.hireType.find(
              (child) => +child.id === +item[headers[key]]?.value || '未知'
            )
          }
          // 返回值的思路
          // 1. 数据里面的key是中文还是英文？ -> 英文
          // 2. headers里面取到中文key对应的英文key
          // 3. 直接去数据对象里面取数据
          return item[headers[key]]
        })
      })
    },
    async getEmpList() {
      const { rows, total } = await getEmployeeList(this.page)
      this.total = total
      this.list = rows
    },
    changeCurrent(page) {
      this.page.page = page
      this.getEmpList()
    },
    formatter(row, column, cellValue) {
      // 要去找 1所对应的值
      const currentData = EmployeeEnum.hireType.find(
        (item) => item.id === cellValue
      )?.value
      return currentData || '未知'
    },
    async del(id) {
      try {
        await this.$confirm('是否删除？')
        await delEmployee(id)
        this.$message.success('删除成功')
        // 重新获取数据
        await this.getEmpList()
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style></style>
