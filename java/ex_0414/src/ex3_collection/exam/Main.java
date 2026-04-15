package ex3_collection.exam;

public class Main {
    public static void main(String[] args) {

        ProductService service = new ProductService();

        // 제품 추가
        service.addProduct(new Product("P001","삼각김밥",1200,10));
        service.addProduct(new Product("P002","사탕",1500,20));
        service.addProduct(new Product("P003","콜라",12050,10));
        service.addProduct(new Product("P004","도시락",11100,60));

        // 전체 출력
        service.printAllProducts();

        // 가격 10% 인상
        service.updateProduct("P001", product -> {
            product.setPrice((int)(product.getPrice() * 1.1));
        });

        System.out.println("\n=== 수정 후 ===");
        service.printAllProducts();

        // 재고 있는 상품만 출력
        System.out.println("\n=== 재고 있는 상품 ===");
        service.findProductsByCondition(p -> p.getStock() > 0);
    }
}