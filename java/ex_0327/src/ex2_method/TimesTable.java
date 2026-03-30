package ex2_method;

import java.util.Scanner;

public class TimesTable {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        System.out.print("구구단 입력: ");
        int dan = sc.nextInt();

        TimesTableMain t = new TimesTableMain();
        t.showTable(dan);
    }
}
