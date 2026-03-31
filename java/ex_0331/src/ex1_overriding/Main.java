package ex1_overriding;

public class Main {
	public static void main(String[] args) {
		RegularEmployee r = new RegularEmployee("김철수",3000000);
		PrarTimeEmployee p = new PrarTimeEmployee("박철수",10000,3);
		System.out.println(r.name + r.getPay());
		System.out.println(p.name + p.getPay());
	}
}
