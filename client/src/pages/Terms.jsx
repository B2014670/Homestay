import React, { useState } from 'react';
import { Collapse } from 'antd';

const { Panel } = Collapse;

const Term = () => {
    return (
        <div className="container mx-auto lg:px-20 md:px-2 px-1 sm:px-6 py-8">
            <Collapse defaultActiveKey={['1']}>
                <Panel header="Quy định chung" key="1" className=''>
                    <div className=''>
                        <p>
                            Khách hàng có thể chọn các hình thức thanh toán Booking sau đây:
                            <br />- Bằng thẻ tín dụng (Visa/Master) thông qua cổng kết nối ngân lượng.
                            <br />- Bằng hình thức thanh toán trực tuyến qua chuyển khoản vào tài khoản ngân hàng Homestay Hon Son.
                            <br />- Bằng tiền mặt (trực tiếp tại đại lý Homestay Hon Son và Mạng lưới liên kết của Homestay Hon Son, nếu có).
                        </p>
                        <p className="text-red-500">
                            * Mọi thanh toán chuyển khoản vào tài khoản ngân hàng Homestay Hon Son được tính theo thời gian làm việc của ngân hàng. Homestay Hon Son chỉ xác nhận vé đã được thanh toán và xuất vé khi nhận được thông báo báo có từ ngân hàng thanh toán.
                        </p>
                        <p>
                            Trong trường hợp Hãng tàu thay đổi về thời hạn xuất vé, chúng tôi bảo lưu quyền phải tuân thủ theo thời hạn xuất vé do các Hãng tàu thông báo. Nếu Quý khách không đồng ý với việc thay đổi về thời hạn xuất vé mới, Quý khách có quyền hủy việc Đặt chỗ.
                        </p>
                        <p>
                            Đối với Đặt chỗ được thanh toán bằng Visa/Master Card, chuyển khoản, qua Thẻ ATM chúng tôi chỉ xuất vé khi có xác nhận được thông báo từ Ngân Hàng.
                        </p>
                        <p>
                            Những vé được Đặt chỗ và thanh toán ngoài khung giờ làm việc của chúng tôi sẽ được giải quyết vào ngày làm việc kế tiếp.
                        </p>
                        <p>
                            Việc Đặt chỗ cận ngày khởi hành (dưới 3 ngày) vui lòng gọi cho Hotline: 0292.222.222 Homestay Hon Son để được hỗ trợ tốt nhất.
                        </p>
                        <p>
                            Những Đặt chỗ không được thanh toán sớm trước thời gian hết hạn giữ chỗ theo quy định thì Đặt chỗ sẽ tự động hủy.
                        </p>
                    </div>
                </Panel>
                <Panel header="Điều khoản thanh toán" key="2">
                    <h1>Chính sách thanh toán và hoàn tiền</h1>

                    <h2 className='text-red-800 font-bold'>I. Thanh toán qua Visa / MasterCard </h2>
                    <p>Chúng tôi chấp nhận thanh toán thẻ trực tuyến qua Ngân Lượng, đảm bảo tất cả dữ liệu thẻ được xử lý an toàn với SSL. Thông tin thẻ của bạn không được lưu trữ. Khi thanh toán bằng thẻ tín dụng, khách hàng phải đảm bảo chi tiết thẻ chính xác và được ủy quyền bởi chủ thẻ. Hòn Sơn Go có quyền yêu cầu xác minh và từ chối giao dịch nếu không xác nhận được danh tính chủ thẻ. Nếu thanh toán bị từ chối, khách hàng phải chọn phương thức khác hoặc hủy đặt vé.</p>

                    <h2 className='text-red-800 font-bold'>II. Thanh toán trực tuyến</h2>
                    <p>Chọn từ các ngân hàng liên kết và xác thực bằng thông tin đăng nhập ngân hàng của bạn. Mã OTP sẽ được gửi tới điện thoại của bạn để xác minh. Nếu thành công, sẽ có thông báo xác nhận thanh toán; nếu không, bạn cần chọn phương thức thanh toán khác.</p>

                    <h2 className='text-red-800 font-bold'>III. Chuyển khoản ngân hàng</h2>
                    <p>Bạn có thể thanh toán qua chuyển khoản ngân hàng và cần thông báo cho Homestay Hon Son sau khi hoàn tất để nhận vé. Thông tin tài khoản ngân hàng được hiển thị trên trang web của chúng tôi.</p>

                    <h2 className='text-red-800 font-bold'>IV. Thanh toán tiền mặt</h2>
                    <p>Khách hàng có thể thanh toán trực tiếp tại văn phòng của Homestay Hon Son.</p>

                    <h2 className='text-red-800 font-bold'>V. Hoàn tiền và hủy bỏ</h2>
                    <p>Để hủy vé hoặc yêu cầu hoàn tiền, vui lòng liên hệ với Hòn Sơn Go qua email hoặc điện thoại. Hoàn tiền sẽ được xử lý trong 1-2 tuần. Trong trường hợp hủy vé, sẽ không có phí hủy trước khi vé được phát hành.</p>
                </Panel>
            </Collapse>
        </div >
    );
};

export default Term;
