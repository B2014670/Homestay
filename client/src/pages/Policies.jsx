import React, { useState } from 'react';
import { Collapse } from 'antd';

const { Panel } = Collapse;

const Policies = () => {
    return (
        <div className="container mx-auto lg:px-20 md:px-2 px-1 sm:px-6 py-8">
            <Collapse defaultActiveKey={['1']}>
                <Panel header="Bảo mật thông tin" key="1" className=''>
                    <div className="text-md font-sans">
                        <p className="">
                            Chính sách bảo mật này thông báo về cách thức mà Công ty thu thập, lưu trữ và xử lý thông tin cá nhân của các Khách hàng. Chúng tôi cam kết bảo mật thông tin và chỉ thu thập những dữ liệu cần thiết để cung cấp dịch vụ tốt nhất.
                        </p>

                        <h4 className='text-red-800 font-bold'>1. Mục đích thu thập</h4>
                        <p>
                            - Cập nhật thông tin chương trình;<br />- Gửi chính sách ưu đãi mới;<br />- Liên hệ giải quyết yêu cầu của khách hàng.
                        </p>

                        <h4 className='text-red-800 font-bold'>2. Loại thông tin thu thập</h4>
                        <p>
                            - Thông tin cá nhân: họ tên, số hộ chiếu;<br />- Thông tin liên lạc: số điện thoại, email.
                        </p>

                        <h4 className='text-red-800 font-bold'>3. Phương pháp thu thập</h4>
                        <p>Thông tin được thu thập qua website và đại lý.</p>

                        <h4 className='text-red-800 font-bold'>4. Thời gian lưu trữ</h4>
                        <p>Thông tin được lưu trữ trong thời gian cung cấp dịch vụ hoặc theo yêu cầu của khách hàng.</p>

                        <h4 className='text-red-800 font-bold'>5. Hủy thông tin cá nhân</h4>
                        <p>Thông tin sẽ bị hủy theo quy định nội bộ và sẽ được xử lý an toàn.</p>

                        <h4 className='text-red-800 font-bold'>6. Quyền của khách hàng</h4>
                        <p>Khách hàng có quyền xem, chỉnh sửa, và yêu cầu xóa thông tin cá nhân.</p>

                        <h4 className='text-red-800 font-bold'>7. Thông tin cá nhân của trẻ em</h4>
                        <p>Chúng tôi sẽ thu thập thông tin của trẻ em dưới 14 tuổi với sự đồng ý của phụ huynh.</p>

                        <h4 className='text-red-800 font-bold'>8. Biện pháp bảo vệ thông tin</h4>
                        <p>Các biện pháp kỹ thuật sẽ được áp dụng để bảo vệ thông tin cá nhân khỏi rò rỉ và xâm phạm.</p>

                        <p>Chính sách này được cập nhật lần cuối vào 04/10/2024.</p>
                    </div>
                </Panel>
                <Panel header="Hoàn hủy tour" key="2">
                    <div className="">

                        <h4 className='text-red-800 font-bold'>1. Trường hợp do Homestay Hon Son hủy tour:</h4>
                        <p>
                            Nếu Homestay Hon Son không thực hiện được chuyến du lịch, Homestay Hon Son phải báo ngay cho khách hàng biết và thanh toán lại cho khách hàng toàn bộ số tiền khách hàng đã đóng trong vòng 3 ngày kể từ lúc việc thông báo hủy chuyến du lịch bằng tiền mặt hoặc chuyển khoản.
                        </p>

                        <h4 className='text-red-800 font-bold'>2. Trường hợp bên khách hàng hủy tour</h4>
                        <p>
                            Trường hợp hủy tour ngay sau khi chốt hoặc ký hợp đồng trước ngày khởi hành 10 ngày quý khách sẽ chịu phí 30% giá tour, từ 5 – 10 ngày phí là 50%, từ 3 – 5 ngày phí 75%, từ 0 – 3 ngày phí 100%.
                        </p>

                        <h4 className='text-red-800 font-bold'>3. Trường hợp hủy tour do yếu tố khách quan</h4>
                        <p>
                            Trường hợp hủy tour do thời tiết, bệnh tật v.v...thì hai bên sẽ không chịu bất kỳ nghĩa vụ bồi hoàn các tổn thất đã xảy ra và không chịu bất kỳ trách nhiệm pháp lý nào. Tuy nhiên mỗi bên có trách nhiệm cố gắng tối đa để giúp đỡ bên bị thiệt hại nhằm giảm thiểu các tổn thất gây ra vì nhiều lý do khách quan.
                        </p>
                    </div>
                </Panel>
            </Collapse>
        </div >
    );
};

export default Policies;
