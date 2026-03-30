package ex1_final;

import java.util.Scanner;

public class ParkingExample {
	public static void main(String[] args) {
		System.out.println("이용시간: ");
		Scanner sc = new Scanner(System.in);
		int time = sc.nextInt();
		
		Parking Parking = new Parking();
		int total = Parking.calculateFee(time);
		System.out.println(total);
	}
}
