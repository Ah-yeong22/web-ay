package ex3_overloading;

public class CalC {
	public void area(int x, int y) {
		System.out.println(x*y);
	}
	
	public double area(double x) {
		return x*x;
	}
}
