package ex3_collection.exam;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import java.util.function.Predicate;

public class ProductService {

    private List<Product> productList = new ArrayList<>();

    // 제품 추가
    public void addProduct(Product product) {
        if (findByCode(product.getCode()) != null) {
            System.out.println("이미 존재하는 코드입니다.");
            return;
        }
        productList.add(product);
    }

    // 전체 출력
    public void printAllProducts() {
        System.out.println("=== 전체 상품 목록 ===");
        for (Product p : productList) {
            System.out.println(p);
        }
    }

    // 코드로 찾기
    public Product findByCode(String code) {
        for (Product p : productList) {
            if (p.getCode().equals(code)) {
                return p;
            }
        }
        return null;
    }

    // 제품 수정 (Consumer 사용 ⭐핵심)
    public void updateProduct(String code, Consumer<Product> updater) {
        Product p = findByCode(code);

        if (p == null) {
            System.out.println("상품이 존재하지 않습니다.");
            return;
        }

        updater.accept(p);
    }

    // 조건 조회 (Predicate 사용 ⭐핵심)
    public void findProductsByCondition(Predicate<Product> condition) {
        for (Product p : productList) {
            if (condition.test(p)) {
                System.out.println(p);
            }
        }
    }
}