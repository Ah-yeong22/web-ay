package ex3_collection.exam;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

public class ProductService {
	
	List<Product> list = new ArrayList<Product>();
	
	public void addProduct(Product product) {
		for(Product p :list) {
			if(p.getCode().equals(product.getCode())){
				System.out.println("이미 존재하는 코드입니다. ");
			}else {
				list.add(product);
			}
		}
		

	}
	
	public void printAllProducts() {
		for(Product p: list) {
			System.out.println(p);
		}
	}
	
	public void updateProduct(String code,Function<Product,Product> updater) {
		
	}
}
