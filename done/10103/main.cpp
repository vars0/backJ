#include <iostream>

int main(int argc, char **argv)
{
  int N;
  std::cin >> N;
  int S1 = 100;
  int S2 = 100;
  for (int i = 1; i <= N; i++)
  {
    int a, b;
    std::cin >> a >> b;
    if (a > b)
      S2 -= a;
    else if (a < b)
      S1 -= b;
  }
  std::cout << S1 << std::endl
            << S2 << std::endl;
  return 0;
}