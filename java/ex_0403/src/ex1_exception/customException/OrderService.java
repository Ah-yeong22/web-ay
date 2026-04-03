package ex1_exception.customException;

public class OrderService {

	public int total(int price,int quantity) throws IllegalArgumentException {
		if(price <0) {
			throw new IllegalArgumentException("가격은 1 이상이어야 함");
		}
		if(quantity <=0) {
			throw new IllegalArgumentException("수량은 1 이상이어야 함");
		}
		return price*quantity;
	}
}
