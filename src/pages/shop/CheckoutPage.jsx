import React, { useState } from 'react';
import { CheckCircle2, Clock, CreditCard, ShoppingBag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { Badge } from '../../components/Badge';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

const checkoutSchema = yup.object({
  paymentMethod: yup
    .string()
    .oneOf(['COD', 'Cash', 'UPI', 'Card'])
    .required('Select a payment method'),
});

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const [order, setOrder] = useState(null);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues: { paymentMethod: 'COD' },
  });

  const tax = Math.round(cartTotal * 0.05);

  const submitOrder = async (values) => {
    setSubmitError('');
    try {
      if (!customer?.id || cart.length === 0) {
        throw new Error('Your session or cart has expired. Please return to the shop and try again.');
      }

      const createdOrder = await orderService.createCustomerOrder({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        items: cart.map((item) => ({
          sareeId: item.sareeId,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentMethod: values.paymentMethod,
        discount: 0,
        notes: 'Customer storefront order',
        staffName: customer.name,
      });

      clearCart();
      setOrder(createdOrder);
      toast.success('Order placed successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Unable to place order';
      setSubmitError(message);
      toast.error(message);
    }
  };

  if (order) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-gold-400/40 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
          <Clock className="h-9 w-9 animate-pulse" />
        </div>

        <h1 className="mt-5 font-brand text-2xl font-bold text-maroon-950">
          Order placed - waiting for the store to accept it
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Thank you, <strong className="text-slate-800">{order.customerName}</strong>. Your online request has been received and is waiting for store staff confirmation.
        </p>

        <div className="my-6 rounded-2xl bg-[#FAF7F2] p-5 text-left text-sm border border-cream-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Order number</span>
            <strong className="font-mono text-maroon-950">{order.orderNumber}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Live Status</span>
            <Badge dot variant="warning">New Request</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Invoice number</span>
            <strong className="font-mono text-gold-700">{order.invoiceNumber}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Payment method</span>
            <span className="font-semibold text-slate-800">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between border-t border-cream-200 pt-2.5">
            <span className="font-semibold text-slate-700">Total Amount</span>
            <strong className="font-brand text-base text-maroon-950">{formatCurrency(order.totalAmount)}</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="gold"
            onClick={() => navigate('/shop/orders')}
            className="w-full sm:w-auto"
          >
            Track Live Status
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_320px]">
      <form
        onSubmit={handleSubmit(submitOrder)}
        className="rounded-2xl border border-cream-200 bg-white p-6 shadow-sm"
      >
        <h1 className="font-brand text-2xl font-bold text-maroon-950">Checkout</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          Signed in as <strong className="text-slate-700">{customer?.name}</strong> ({customer?.phone}).
        </p>

        <div className="space-y-4">
          <Select
            label="Payment method"
            icon={CreditCard}
            required
            error={errors.paymentMethod?.message}
            options={[
              { value: 'COD', label: 'Cash on Delivery (COD)' },
              { value: 'UPI', label: 'UPI (GooglePay / PhonePe / Paytm)' },
              { value: 'Card', label: 'Credit / Debit Card' },
            ]}
            {...register('paymentMethod')}
          />
        </div>

        {submitError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
          >
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="mt-6 w-full"
          isLoading={isSubmitting}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </Button>
      </form>

      <aside className="h-fit rounded-2xl border border-gold-400/50 bg-white p-5 shadow-sm">
        <h2 className="font-brand text-xl font-bold text-maroon-950">Order summary</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Items ({cart.reduce((s, i) => s + i.quantity, 0)} pcs)</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tax (5% GST)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between border-t border-cream-200 pt-3 text-base font-bold text-maroon-950">
            <span>Total Payable</span>
            <span>{formatCurrency(cartTotal + tax)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};
