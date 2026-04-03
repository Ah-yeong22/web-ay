package ex2_object;

public class EqualsExample {

	public static void main(String[] args) {
		Member obj1 = new Member("blue");
		Member obj2 = new Member("blue");
		Member obj3 = new Member("red");
		
		if(obj1.equals(obj2)) {
			System.out.println("1,2는 동일함 ");
		}else {
			System.out.println("다름");
		}
		if(obj1.equals(obj3)) {
			System.out.println("1,3는 동일함 ");
		}else {
			System.out.println("다름");
		}
	}
}
