package ex1_innerclass.staticclass;

public class Main {

    public static void main(String[] args) {
    	
    	//정적 내부클래스의 객체 생성방법
    	Outer.Inner inner = new Outer.Inner();
    	User user = new User.Builder("홍", "1234")
    	        .name("홍길동")
    	        .age(20)
    	        .build();

    }
}