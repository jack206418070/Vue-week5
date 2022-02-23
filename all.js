const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const path = 'ginjack';
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});



const app = Vue.createApp({
    data(){
        return{
            products:[],
            carts:[],
            total_price: 0,
            is_loading: false,
            tempProduct:{},
            form:{
                user:{
                    tel: '',
                    address: '',
                    name: '',
                    email: ''
                },
                message: ''
            }
        }
    },
    methods:{
        getProducts(){
            axios.get(`${apiUrl}/api/${path}/products`)
            .then((res) => {
                this.products[0] = res.data.products[0];
                this.products[1] = res.data.products[1];
                this.products[2] = res.data.products[2];
            })
            .catch((err) => {
                console.dir(err);
            })
        },
        addCart(item){
            let data = {}
            if(typeof item == 'string'){
                data = {
                    "data": {
                        "product_id": item,
                        "qty": 1,
                    }
                } 
            }else{
                data = {
                    "data": {
                        "product_id": item.id,
                        "qty": item.qty,
                    }
                } 
            }
            this.closeModal();
            this.loading();
            axios.post(`${apiUrl}/api/${path}/cart`,data)
                .then((res) => {
                    res.data.data.carts;
                    this.getCarts();
                    this.loading();
                })
                .catch((err) => {
                    console.dir(err);
                })
        },
        getCarts(){
            this.total_price = 0;
            axios.get(`${apiUrl}/api/${path}/cart`)
                .then((res) => {
                    this.carts = res.data.data.carts;
                    this.carts.forEach((item) => {
                        this.total_price += item.final_total;
                    })
                })
                .catch((err) => {
                    console.dir(err)
                })
        },
        deleteCart(id){
            this.loading();
            axios.delete(`${apiUrl}/api/${path}/cart/${id}`)
                .then((res) => {
                    this.loading();
                    this.getCarts();
                })
                .catch((err) => {
                    console.dir(err)
                })
        },
        editCart(item){
            this.loading();
            let data = {
                "data":{
                    "product_id":item.product_id,
                    "qty": +item.qty
                }
            }
            axios.put(`${apiUrl}/api/${path}/cart/${item.id}`,data)
            .then((res) => {
                this.loading();
                this.getCarts();
            })
            .catch((err) => {
                console.dir(err);
            })
        },
        loading(){
            this.is_loading = !this.is_loading;
        },
        openModal(item){
            this.tempProduct = {...item};
            this.$refs.productModal.openModal();
        },
        closeModal(){
            this.tempProduct = {};
            this.$refs.productModal.closeModal();
        },
        onSubmit(){
            const order = {
                user:{...this.user}
            };
            axios.post(`${apiUrl}/api/${path}/order`, { data: order })
                .then((res) => {
                    this.user = {
                        tel: '',
                        address: '',
                        name: '',
                        email: ''
                    }
                    this.getCarts();
                })
                .catch((err) => {
                    console.dir(err)
                })

        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        },
        deleteAllCart(){
            axios.delete(`${apiUrl}/api/${path}/carts`)
                .then((res) => {
                    this.getCarts();
                })
                .catch((err) => {
                    console.dir(err)
                })
        }
    },
    mounted(){
        this.getProducts();
        this.getCarts();
    }
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.component('product-modal',{
    props:['productdata'],
    emits:['addcart'],
    data(){
        return{
            is_modal: false,
            tempProduct:{}
        }
    },
    template:'#product-modal',
    methods:{
        openModal(){
            this.is_modal = true;
        },
        closeModal(){
            this.tempProduct = {};
            this.is_modal = false;
        }
    },
    watch:{
        productdata(){
            this.tempProduct = {
                ...this.productdata,
                qty: 1
            }
        }
    },
    mounted(){
        this.tempProduct = {
            ...this.productdata,
            qty: 1
        }
    }
});



app.mount('#app');