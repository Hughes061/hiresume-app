import Header from "@/pages/components/layout/header";
import prisma from "../../../../lib/prisma";
import { DecodedToken, HandleError } from "@/backend-utils/types";
import jwtDecode from "jwt-decode";
import { GetServerSideProps } from "next";
import { Client, Payment, UserRole } from "@prisma/client";
import Image from "next/image";
import { format } from "date-fns";
import { useState } from "react";
import Modal from "@/pages/components/utils/Modal";
import Input from "@/pages/components/utils/input";
import useForm from "@/pages/components/hooks/form";
import Button from "@/pages/components/utils/button";
import axios from "axios";
import { useRouter } from "next/router";
import ErrorMessage from "@/pages/components/utils/error";
import Success from "@/pages/components/utils/success";

type Props = {
 data:Data
}

export default function Profile({data}:Props){
  const {token, user}=data
  const [openPaymentModal, setOpenPaymentModal] = useState(false)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<HandleError[]>([])
const router = useRouter()
  const submitPayment = async (values:any)=>{
    setLoading(true);
    setErrors([]);
    try {
      const res = await axios.post(
        `/api/payment/payment`,

        {
          ...values,
          client_id:user?.client?.id
          
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const {
        data,
        errors: serverErrors,
      }: {
        data: boolean | null;
        errors: Error[] | [];
      } = await res.data;

      if (serverErrors.length > 0 || !data) {
        setLoading(false);
        setErrors([...serverErrors]);
        return;
      }
      console.log(success);
      setSuccess(true);
      setErrors([]);
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
      setTimeout(() => {
        router.reload();
      }, 2000);
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      setLoading(false);
      error.response?.data.errors && error.response.data.errors.length > 0
        ? setErrors([...error.response.data.errors])
        : setErrors([
            {
              message: "something unexpected happened try again later",
            },
          ]);
      setLoading(false);
      setTimeout(() => {
        setErrors([]);
      }, 2000);
    }
  }
  const {handleChange, handleSubmit, values } = useForm({amount:0, client_id:0},submitPayment )
 return <>
 <Header user={user} />
 <div   className="w-full min-h-screen py-20 items-center justify-center" >
      <div className="max-w-4xl mx-auto border rounded-md pb-6 border-slate-300 bg-transparent px-2 py-4 flex flex-col gap-y-2" >
        <div className="w-full flex flex-col items-center justify-center gap-y-1">
          <Image  alt="client profile" src={`${user?.pictureUrl}`} width={500} height={500} className="w-24 h-24 rounded-full" />
          <p className="text-slate-600 font-semibold text-sm" >{user?.firstName}{user?.lastName}</p>
        </div>
        <div  className="border py-4 px-3 border-slate-400 rounded-md  flex flex-col gap-y-3 items-start justify-start text-left">
          <h1 className="text-2x text-slate-300 font-bold" >Balance</h1>
     <div className="flex text-sm font-medium text-slate-300 w-full items-center justify-between"> 
     <p>Your balance is <strong>0.00$</strong></p>
     <button
     onClick={()=>setOpenPaymentModal(true)}
           className="inline-flex items-center justify-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full "
          >
            pay now
          </button>
     </div>
        </div>
        <div  className="border py-4 px-3 border-slate-400 rounded-md  flex flex-col gap-y-3 items-start justify-start text-left">
          <h1 className="text-2x text-slate-300 font-bold" >Past payments</h1>
     <div className="flex text-sm font-medium text-slate-300 w-full flex-col items-center gap-y-2"> 
           {user?.client?.payments && user?.client?.payments.length > 0 ? user?.client?.payments.map((payment)=>{
               return  <span key={payment.payment_id} className="flex item-center justify-between text-slate-100 font-medium" > {payment.payment_amount} {format(new Date(`${payment.payment_created_at}`), "MMMM/dd/yyyy")}  </span>
  }) : <span>no current payments</span>}
     </div>
        </div>
      </div>
 </div>
 <Modal  span="max-w-md" isOpen={openPaymentModal} setIsOpen={setOpenPaymentModal} >
    <div className="w-full flex flex-col py-4 px-4" >
   <h1 className="text-left text-slate-300 font-bold text-lg" >Make payment</h1>
   <form  onSubmit={handleSubmit} className="mt-1 py-4 flex flex-col gap-y-2" >
    <Input  
    type="number"
    label="amount"
    name="amount"
    onChange={handleChange}
    value={values.amount}
    />
    <Button text="submit payment" type="submit" loading={loading}  />
   </form>
   <ErrorMessage errors={errors} />
   <Success message="your payment has been submitted"  success={success} />
    </div>
 </Modal>
 </>
}



type Data = {
token:string
 user: ClientLoggedIn
;
};

export type ClientLoggedIn = {
  id: number;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
  pictureUrl: string;
  client: (Client & {
      payments: Payment[];
  }) | null;
} | null
//@ts-ignore
export const getServerSideProps: GetServerSideProps<{ data: Data }> = async (
 context
) => {
 const { req } = context;
console.log(req.cookies.access_token)
 const access_token = req.cookies.access_token;
 if (!access_token || access_token.trim() === "") {
   return {
     redirect: {
       permanent: false,
       destination: "/",
     },
   };
 }

 const decodedToken: DecodedToken = jwtDecode(access_token);

 if (decodedToken.exp < Date.now() / 1000) {
   return {
     redirect: {
       permanent: false,
       destination: "/",
     },
   };
 }

 const loggedInUser = await prisma.user.findUnique({
   where: {
     id: decodedToken.user_id,
   },
   select: {
     password: false,
     id: true,
     role: true,
     email: true,
     firstName: true,
     lastName: true,
     pictureUrl: true,
     client:{
      include:{
       payments:true
      }
     }
   },
 });



 return {
   props: {
     data: {
       token:access_token,
       user: JSON.parse(JSON.stringify(loggedInUser)),
     },
   },
 };
};
