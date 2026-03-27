package ex2_method;

import java.util.Scanner;

public class TimesTable {
	
	public void showTable (int a) {
		Scanner sc = new Scanner(System.in);
		System.out.println("구구단: ");
		int gugu = sc.nextInt();
		
		for(int i=1; i<=9; i++) {
			System.out.println(gugu*i);
		}
			
	}
}
